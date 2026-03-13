import React, {FC, useState} from 'react';
import cn from 'bem-cn-lite';
import {SegmentedRadioGroup} from '@gravity-ui/uikit';
import {
    NavigationTableData,
    NavigationTableMeta,
    NavigationTableSchema,
    YsonSettings,
} from '../../types';
import type {SchemaDataTypeProps} from '../../components/SchemaDataType';
import i18n from './i18n';
import {SchemaTab} from './SchemaTab';
import {PreviewTab} from './PreviewTab';
import {MetaTab} from './MetaTab';
import './NavigationTable.scss';

const b = cn('navigation-table');

const enum TableTab {
    Schema = 'schema',
    Preview = 'preview',
    Meta = 'meta',
}

export type NavigationTableProps = {
    table: NavigationTableData | null;
    filter?: string;
    onFilterChange?: (value: string) => void;
    onInsertTableSelect?: () => void | Promise<void>;
    ysonSettings: YsonSettings;
    emptyMessage?: React.ReactNode;
    lang?: string;
    /** Primitive type names for schema type tooltips (e.g. from supported-features.primitive_types) */
    primitiveTypes?: SchemaDataTypeProps['primitiveTypes'];
    renderSchemaTab?: (props: {
        schema: NavigationTableSchema[];
        filter: string;
        onFilterChange: (value: string) => void;
    }) => React.ReactNode;
    renderPreviewTab?: (props: {
        table: NavigationTableData;
        onEditorInsert: () => void | Promise<void>;
        ysonSettings?: unknown;
        primitiveTypes?: SchemaDataTypeProps['primitiveTypes'];
    }) => React.ReactNode;
    renderMetaTab?: (props: {items: NavigationTableMeta[][]}) => React.ReactNode;
};

export const NavigationTable: FC<NavigationTableProps> = ({
    table,
    filter: controlledFilter,
    onFilterChange: controlledOnFilterChange,
    onInsertTableSelect,
    ysonSettings,
    emptyMessage,
    lang,
    primitiveTypes,
    renderSchemaTab,
    renderPreviewTab,
    renderMetaTab,
}) => {
    const [activeTab, setActiveTab] = useState(TableTab.Schema);
    const [internalFilter, setInternalFilter] = useState('');
    const filter = controlledFilter ?? internalFilter;
    const setFilter = controlledOnFilterChange ?? setInternalFilter;

    const handleChangeTab = (id: string) => {
        setActiveTab(id as TableTab);
    };

    if (!table) {
        return <div className={b()}>{emptyMessage ?? i18n('context_empty-data')}</div>;
    }

    const schemaData = {schema: table.schema, lang, filter, onFilterChange: setFilter};
    const schemaContent =
        activeTab === TableTab.Schema &&
        (renderSchemaTab ? renderSchemaTab(schemaData) : <SchemaTab {...schemaData} />);

    const previewData = {
        table,
        lang,
        onEditorInsert: onInsertTableSelect ?? (() => {}),
        ysonSettings,
        primitiveTypes,
    };
    const previewContent =
        activeTab === TableTab.Preview &&
        (renderPreviewTab ? renderPreviewTab(previewData) : <PreviewTab {...previewData} />);

    const metaContent =
        activeTab === TableTab.Meta &&
        (renderMetaTab ? renderMetaTab({items: table.meta}) : <MetaTab items={table.meta} />);

    return (
        <div className={b()}>
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
