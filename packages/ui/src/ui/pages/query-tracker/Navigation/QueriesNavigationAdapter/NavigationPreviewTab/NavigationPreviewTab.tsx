import React, {useMemo} from 'react';
import {NavigationPreview} from '@gravity-ui/querieskit';
import {ColumnCell, SchemaDataType, type Type} from '@ytsaurus/components';
import {Button, Flex, Icon, Tooltip} from '@gravity-ui/uikit';
import {ArrowUpRightFromSquare} from '@gravity-ui/icons';

import {useSelector} from '../../../../../store/redux-hooks';
import {
    selectNavigationClusterConfig,
    selectNavigationPath,
    selectNavigationTable,
} from '../../../../../store/selectors/query-tracker/queryNavigation';
import {selectQueryEngine} from '../../../../../store/selectors/query-tracker/query';
import {selectPageSize} from '../../../../../store/selectors/navigation/content/table-ts';
import {selectYsonSettingsDisableDecode} from '../../../../../store/selectors/thor/unipika';
import {Yson} from '../../../../../components/Yson/Yson';
import ErrorBoundary from '../../../../../containers/ErrorBoundary/ErrorBoundary';
import {rumLogError} from '../../../../../rum/rum-counter';
import unipika from '../../../../../common/thor/unipika';
import {wrapApiPromiseByToaster} from '../../../../../utils/utils';
import {useMonaco} from '../../../hooks/useMonaco';
import {createTableSelect} from '../../helpers/createTableSelect';
import {insertTextWhereCursor} from '../../helpers/insertTextWhereCursor';
import {prepareNavigationPreview} from '../adapters';
import i18n from '../i18n';

const noPreview = () => {};

export function NavigationPreviewTab() {
    const table = useSelector(selectNavigationTable);
    const clusterConfig = useSelector(selectNavigationClusterConfig);
    const path = useSelector(selectNavigationPath);
    const engine = useSelector(selectQueryEngine);
    const limit = useSelector(selectPageSize);
    const ysonSettings = useSelector(selectYsonSettingsDisableDecode);
    const {getEditor} = useMonaco();
    const preview = useMemo(() => {
        const {data, fallbackColumns} = prepareNavigationPreview(table);
        const rawFormat = ysonSettings.format === 'raw-json';
        return {
            ...data,
            rows: rawFormat ? (table?.rows ?? []) : data.rows,
            columns: data.columns.map((column) => {
                const typeV3 = table?.schema.find(({name}) => name === column.name)?.type_v3;
                return {
                    ...column,
                    header: (
                        <Tooltip
                            content={
                                typeV3 ? <SchemaDataType typeV3={typeV3 as Type} /> : undefined
                            }
                        >
                            <Yson
                                value={unipika.unescapeKeyValue(column.name)}
                                settings={ysonSettings}
                                inline
                            />
                        </Tooltip>
                    ),
                    // QueriesKit accepts YQL wire values. Keep the YT formatter for raw YSON
                    // and columns whose cells have different wire types.
                    render:
                        rawFormat || fallbackColumns.includes(column.name)
                            ? ({value, index}: {value: unknown; index: number}) => (
                                  <ColumnCell
                                      value={
                                          value as React.ComponentProps<typeof ColumnCell>['value']
                                      }
                                      yqlTypes={
                                          table?.yqlTypes as React.ComponentProps<
                                              typeof ColumnCell
                                          >['yqlTypes']
                                      }
                                      ysonSettings={ysonSettings}
                                      rowIndex={index}
                                      columnName={column.name}
                                      onShowPreview={noPreview}
                                      logError={rumLogError}
                                      ErrorBoundaryComponent={ErrorBoundary}
                                  />
                              )
                            : undefined,
                };
            }),
        };
    }, [table, ysonSettings]);

    const insertSelect = async () => {
        if (!clusterConfig) return;
        const editor = getEditor('queryEditor');
        const text = await wrapApiPromiseByToaster(
            createTableSelect({clusterConfig, path, engine, limit}),
            {skipSuccessToast: true, toasterName: 'query_navigation_insert_select'},
        ).catch(() => undefined);
        if (text !== undefined) insertTextWhereCursor(text, editor);
    };

    return (
        <Flex direction="column" gap={2}>
            <div>
                <Button onClick={insertSelect} disabled={!table}>
                    <Icon data={ArrowUpRightFromSquare} />
                    {i18n('action_insert-select')}
                </Button>
            </div>
            <NavigationPreview
                data={preview}
                view={{formatterSettings: {...ysonSettings, treatValAsData: true}}}
                hideToolbar
            />
        </Flex>
    );
}
