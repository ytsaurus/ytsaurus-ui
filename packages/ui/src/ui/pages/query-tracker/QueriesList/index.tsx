import React from 'react';
import block from 'bem-cn-lite';
import {LegacyQueriesList} from './LegacyQueriesList';
import {getQueriesListTabName, useQueriesListState} from './useQueriesListState';
import './index.scss';

const b = block('queries-list');

export function QueriesList() {
    const {activeTab, tabsList, onTabChange} = useQueriesListState();
    if (!tabsList.includes(activeTab)) return null;
    return (
        <div className={b()}>
            <LegacyQueriesList
                tabs={tabsList.map((id) => ({id, title: getQueriesListTabName(id)}))}
                activeTab={activeTab}
                onTabChange={onTabChange}
            />
        </div>
    );
}
