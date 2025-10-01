import React, {FC, useState} from 'react';
import {RadioButton} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import './NavigationTable.scss';
import {SchemaTab} from './SchemaTab';
import {useSelector} from 'react-redux';
import {
    selectNavigationClusterConfig,
    selectNavigationPath,
    selectTableWithFilter,
} from '../../../../store/selectors/queries/queryNavigation';
import MetaTable from '../../../../components/MetaTable/MetaTable';
import {PreviewTab} from './PreviewTab';
import {insertTextWhereCursor} from '../helpers/insertTextWhereCursor';
import {createTableSelect} from '../helpers/createTableSelect';
import {useMonaco} from '../../hooks/useMonaco';
import {getQueryEngine} from '../../../../store/selectors/queries/query';
import {getPageSize} from '../../../../store/selectors/navigation/content/table-ts';
import {getYsonSettingsDisableDecode} from '../../../../store/selectors/thor/unipika';

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

    if (!table) return <div>Empty data</div>;

    return (
        <div className={b()}>
            <RadioButton
                defaultValue={activeTab}
                onUpdate={handleChangeTab}
                options={[
                    {value: TableTab.Schema, content: 'Schema'},
                    {value: TableTab.Preview, content: 'Preview'},
                    {value: TableTab.Meta, content: 'Meta'},
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
