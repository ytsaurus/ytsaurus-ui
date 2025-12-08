import React, {FC, useState} from 'react';
import {SegmentedRadioGroup} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import './NavigationTable.scss';
import {SchemaTab} from './SchemaTab';
import {useSelector} from '../../../../store/redux-hooks';
import {
    selectNavigationClusterConfig,
    selectNavigationPath,
    selectTableWithFilter,
} from '../../../../store/selectors/query-tracker/queryNavigation';
import MetaTable from '../../../../components/MetaTable/MetaTable';
import {PreviewTab} from './PreviewTab/PreviewTab';
import {insertTextWhereCursor} from '../helpers/insertTextWhereCursor';
import {createTableSelect} from '../helpers/createTableSelect';
import {useMonaco} from '../../hooks/useMonaco';
import {getQueryEngine} from '../../../../store/selectors/query-tracker/query';
import {getPageSize} from '../../../../store/selectors/navigation/content/table-ts';
import {getYsonSettingsDisableDecode} from '../../../../store/selectors/thor/unipika';
import i18n from './i18n';

const enum TableTab {
    Schema = 'schema',
    Preview = 'preview',
    Meta = 'meta',
}

const b = cn('qt-navigation-table');

export const NavigationTable: FC = () => {
    const [activeTab, setActiveTab] = useState(TableTab.Schema);
    const clusterConfig = useSelector(selectNavigationClusterConfig);
    const table = useSelector(selectTableWithFilter);
    const engine = useSelector(getQueryEngine);
    const limit = useSelector(getPageSize);
    const path = useSelector(selectNavigationPath);
    const ysonSettings = useSelector(getYsonSettingsDisableDecode);
    const {getEditor} = useMonaco();

    const handleChangeTab = (id: string) => {
        setActiveTab(id as TableTab);
    };

    const handleInsertTableSelect = async () => {
        if (!clusterConfig) return;
        const editor = getEditor('queryEditor');
        const text = await createTableSelect({clusterConfig, path, engine, limit});
        insertTextWhereCursor(text, editor);
    };

    if (!table) return <div>{i18n('context_empty-data')}</div>;

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
                {activeTab === TableTab.Schema && <SchemaTab schema={table.schema} />}
                {activeTab === TableTab.Preview && (
                    <PreviewTab
                        table={table}
                        onEditorInsert={handleInsertTableSelect}
                        ysonSettings={ysonSettings}
                    />
                )}
                {activeTab === TableTab.Meta && <MetaTable items={table.meta} />}
            </div>
        </div>
    );
};
