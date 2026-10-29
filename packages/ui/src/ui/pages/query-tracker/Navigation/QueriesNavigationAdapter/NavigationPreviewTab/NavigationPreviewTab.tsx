import {useNavigationQueryActions} from '../../useNavigationQueryActions';
import React, {useMemo} from 'react';
import {NavigationPreview} from '@gravity-ui/querieskit';
import {ColumnCell, SchemaDataType, type Type} from '@ytsaurus/components';
import {Button, Flex, Icon, Tooltip} from '@gravity-ui/uikit';
import {ArrowUpRightFromSquare} from '@gravity-ui/icons';

import {useSelector} from '../../../../../store/redux-hooks';
import {
    selectNavigationTable,
    selectPathActionsNode,
} from '../../../../../store/selectors/query-tracker/queryNavigation';
import {selectPageSize} from '../../../../../store/selectors/navigation/content/table-ts';
import {selectYsonSettingsDisableDecode} from '../../../../../store/selectors/thor/unipika';
import {Yson} from '../../../../../components/Yson/Yson';
import ErrorBoundary from '../../../../../containers/ErrorBoundary/ErrorBoundary';
import {rumLogError} from '../../../../../rum/rum-counter';
import unipika from '../../../../../common/thor/unipika';
import {getNavigationCellType, prepareNavigationPreview} from '../adapters';
import i18n from '../i18n';

const noPreview = () => {};

export function NavigationPreviewTab() {
    const table = useSelector(selectNavigationTable);
    const node = useSelector(selectPathActionsNode);
    const limit = useSelector(selectPageSize);
    const ysonSettings = useSelector(selectYsonSettingsDisableDecode);
    const {insertSelect} = useNavigationQueryActions();
    const preview = useMemo(() => {
        const data = prepareNavigationPreview(table);
        const rawFormat = ysonSettings.format === 'raw-json';
        return {
            ...data,
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
                    render: rawFormat
                        ? ({value, index}: {value: unknown; index: number}) => (
                              <ColumnCell
                                  value={value as React.ComponentProps<typeof ColumnCell>['value']}
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

    return (
        <Flex direction="column" gap={2}>
            <div>
                <Button onClick={() => insertSelect(node, limit)} disabled={!table}>
                    <Icon data={ArrowUpRightFromSquare} />
                    {i18n('action_insert-select')}
                </Button>
            </div>
            <NavigationPreview
                data={preview}
                view={{
                    formatterSettings: {...ysonSettings, treatValAsData: true},
                    getCellValue: ({value}) => (Array.isArray(value) ? value[0] : undefined),
                    getCellType: ({row, column}) =>
                        getNavigationCellType(row[column.name], table?.yqlTypes ?? null),
                }}
                hideToolbar
            />
        </Flex>
    );
}
