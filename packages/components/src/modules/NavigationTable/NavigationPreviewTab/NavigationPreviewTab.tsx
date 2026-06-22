import React, {FC, useMemo} from 'react';
import cn from 'bem-cn-lite';
import {Button, Icon} from '@gravity-ui/uikit';
import ArrowUpRightFromSquareIcon from '@gravity-ui/icons/svgs/arrow-up-right-from-square.svg';
import {LogErrorFn, NavigationTableData} from '../../../types';
import type {UnipikaSettings} from '../../../internal/Yson/StructuredYson/StructuredYsonTypes';
import i18n from './i18n';
import {DataTableYT} from '../../../components';
import {prepareColumns} from '../helpers/prepareColumns';
import type {SchemaDataTypePrimitiveTypes} from '../../../components/SchemaDataType';
import './NavigationPreviewTab.scss';
import type {ErrorBoundaryProps} from '../../../internal/DefaultErrorBoundary';

const b = cn('navigation-table-preview-tab');

const previewTableSettings = {sortable: false as const};

type PreviewTabProps = {
    table: NavigationTableData;
    onEditorInsert?: () => void | Promise<void>;
    ysonSettings?: UnipikaSettings;
    primitiveTypes?: SchemaDataTypePrimitiveTypes;
    logError?: LogErrorFn;
    ErrorBoundaryComponent?: React.ComponentType<ErrorBoundaryProps>;
};

export const NavigationPreviewTab: FC<PreviewTabProps> = ({
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
            table,
            ysonSettings,
            onShowPreview,
            primitiveTypes,
            logError,
            ErrorBoundaryComponent,
        });
    }, [table, ysonSettings, primitiveTypes]);

    if (!table) return null;

    return (
        <div className={b()}>
            {onEditorInsert ? (
                <Button onClick={() => onEditorInsert()}>
                    <Icon data={ArrowUpRightFromSquareIcon} size={16} />
                    {i18n('action_insert-select')}
                </Button>
            ) : null}
            <DataTableYT
                className={b()}
                columns={columns}
                data={table.rows}
                settings={previewTableSettings}
                useThemeYT
            />
        </div>
    );
};
