import React, {FC, useMemo} from 'react';
import cn from 'bem-cn-lite';
import {Button, Icon} from '@gravity-ui/uikit';
import ArrowUpRightFromSquareIcon from '@gravity-ui/icons/svgs/arrow-up-right-from-square.svg';
import {LogErrorFn, NavigationTableData} from '../../types';
import type {UnipikaSettings} from '../../internal/Yson/StructuredYson/StructuredYsonTypes';
import i18n from './i18n';
import {DataTableYT} from '../../components';
import {prepareColumns} from './prepareColumns';
import type {SchemaDataTypePrimitiveTypes, TypeArray} from '../../components/SchemaDataType';
import './PreviewTab.scss';
import type {ErrorBoundaryProps} from '../../internal/DefaultErrorBoundary';

const b = cn('navigation-table-preview-tab');

type PreviewTabProps = {
    table: NavigationTableData;
    onEditorInsert: () => void | Promise<void>;
    ysonSettings?: UnipikaSettings;
    primitiveTypes?: SchemaDataTypePrimitiveTypes;
    logError?: LogErrorFn;
    ErrorBoundaryComponent?: React.ComponentType<ErrorBoundaryProps>;
};

export const PreviewTab: FC<PreviewTabProps> = ({
    table,
    onEditorInsert,
    ysonSettings,
    primitiveTypes,
    logError,
    ErrorBoundaryComponent,
}) => {
    const onShowPreview = () => {};
    const columns = useMemo(() => {
        return prepareColumns({
            columns: table.columns.map((i) => ({name: i})),
            keyColumns: [],
            yqlTypes: table.yqlTypes as TypeArray[] | null,
            ysonSettings,
            useRawStrings: undefined,
            schemaByName: table.schema.reduce<
                Record<
                    string,
                    {
                        name: string;
                        required: boolean;
                        sort_order?: string;
                        type: string;
                    }
                >
            >((acc, item) => {
                acc[item.name] = item;
                return acc;
            }, {}),
            onShowPreview,
            primitiveTypes,
            logError,
            ErrorBoundaryComponent,
        });
    }, [table, ysonSettings, primitiveTypes]);

    return (
        <div className={b()}>
            <Button onClick={() => onEditorInsert()}>
                <Icon data={ArrowUpRightFromSquareIcon} size={16} />
                {i18n('action_insert-select')}
            </Button>
            <DataTableYT className={b()} columns={columns} data={table.rows} useThemeYT />
        </div>
    );
};
