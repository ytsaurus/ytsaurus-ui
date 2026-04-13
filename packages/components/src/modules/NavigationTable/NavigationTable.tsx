import React, {FC, useState} from 'react';
import cn from 'bem-cn-lite';
import {SegmentedRadioGroup} from '@gravity-ui/uikit';
import {
    LogErrorFn,
    NavigationTableData,
    NavigationTableMeta,
    NavigationTableSchema,
} from '../../types';
import type {UnipikaSettings} from '../../internal/Yson/StructuredYson/StructuredYsonTypes';
import type {SchemaDataTypeProps} from '../../components';
import {MetaTable} from '../../components';
import i18n from './i18n';
import {SchemaTab} from './SchemaTab';
import {PreviewTab} from './PreviewTab';
import './NavigationTable.scss';
import type {ErrorBoundaryProps} from '../../internal/DefaultErrorBoundary';

const b = cn('navigation-table');

const enum TableTab {
    Schema = 'schema',
    Preview = 'preview',
    Meta = 'meta',
}

/** Pick the tab shown on first render (non-null `table` only). */
export type NavigationTableInitialTab = 'schema' | 'preview' | 'meta';

const TABLE_TAB_FROM_INITIAL: Record<NavigationTableInitialTab, TableTab> = {
    schema: TableTab.Schema,
    preview: TableTab.Preview,
    meta: TableTab.Meta,
};

export type NavigationTableProps = {
    table: NavigationTableData | null;
    initialActiveTab?: NavigationTableInitialTab;
    filter?: string;
    onFilterChange?: (value: string) => void;
    onInsertTableSelect?: () => void | Promise<void>;
    ysonSettings?: UnipikaSettings;
    emptyMessage?: React.ReactNode;
    primitiveTypes?: SchemaDataTypeProps['primitiveTypes'];
    renderSchemaTab?: (props: {
        schema: NavigationTableSchema[];
        filter: string;
        onFilterChange: (value: string) => void;
        ysonSettings?: UnipikaSettings;
    }) => React.ReactNode;
    renderPreviewTab?: (props: {
        table: NavigationTableData;
        onEditorInsert: () => void | Promise<void>;
        ysonSettings?: UnipikaSettings;
        primitiveTypes?: SchemaDataTypeProps['primitiveTypes'];
    }) => React.ReactNode;
    renderMetaTab?: (props: {items: NavigationTableMeta[][]}) => React.ReactNode;
    className?: string;
    logError?: LogErrorFn;
    ErrorBoundaryComponent?: React.ComponentType<ErrorBoundaryProps>;
};

export const NavigationTable: FC<NavigationTableProps> = ({
    table,
    initialActiveTab,
    filter: controlledFilter,
    onFilterChange: controlledOnFilterChange,
    onInsertTableSelect,
    ysonSettings,
    emptyMessage,
    primitiveTypes,
    renderSchemaTab,
    renderPreviewTab,
    renderMetaTab,
    className,
    logError,
    ErrorBoundaryComponent,
}) => {
    const [activeTab, setActiveTab] = useState<TableTab>(() =>
        initialActiveTab ? TABLE_TAB_FROM_INITIAL[initialActiveTab] : TableTab.Schema,
    );
    const [internalFilter, setInternalFilter] = useState('');
    const filter = controlledFilter ?? internalFilter;
    const setFilter = controlledOnFilterChange ?? setInternalFilter;

    const handleChangeTab = (id: string) => {
        setActiveTab(id as TableTab);
    };

    if (!table) {
        return (
            <div className={b(null, className)}>{emptyMessage ?? i18n('context_empty-data')}</div>
        );
    }

    const schemaData = {schema: table.schema, filter, onFilterChange: setFilter, ysonSettings};
    const schemaContent =
        activeTab === TableTab.Schema &&
        (renderSchemaTab ? renderSchemaTab(schemaData) : <SchemaTab {...schemaData} />);

    const previewData = {
        table,
        onEditorInsert: onInsertTableSelect ?? (() => {}),
        ysonSettings,
        primitiveTypes,
    };
    const previewContent =
        activeTab === TableTab.Preview &&
        (renderPreviewTab ? (
            renderPreviewTab(previewData)
        ) : (
            <PreviewTab
                {...previewData}
                logError={logError}
                ErrorBoundaryComponent={ErrorBoundaryComponent}
            />
        ));

    const metaContent =
        activeTab === TableTab.Meta &&
        (renderMetaTab ? renderMetaTab({items: table.meta}) : <MetaTable items={table.meta} />);

    return (
        <div className={b(null, className)}>
            <SegmentedRadioGroup
                defaultValue={activeTab}
                onUpdate={handleChangeTab}
                options={[
                    {value: TableTab.Schema, content: i18n('title_schema')},
                    {value: TableTab.Preview, content: i18n('title_preview')},
                    {value: TableTab.Meta, content: i18n('title_meta')},
                ]}
            />
            <div className={b('content')}>
                {schemaContent}
                {previewContent}
                {metaContent}
            </div>
        </div>
    );
};
