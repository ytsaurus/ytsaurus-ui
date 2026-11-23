import React from 'react';
import {Flex, Text} from '@gravity-ui/uikit';
import {type QueriesListFilter} from '../../../../../types/query-tracker/queryList';
import {QueryDateFilter} from '../QueryDateFilter';
import {QueryUserFilter} from '../QueryUserFilter';
import {QueryStateFilter} from '../QueryStateFilter';
import {QueryEngineFilter} from '../QueryEngineFilter';
import {QueryFastUserFilter} from '../QueryFastUserFilter';
import i18n from '../FilterDropdown/i18n';
import engineI18n from '../QueryEngineFilter/i18n';

type Props = {
    value: QueriesListFilter;
    onChange: (patch: QueriesListFilter) => void;
    /** The legacy toolbar already contains the quick owner and engine filters. */
    includeQuickFilters?: boolean;
};

export function HistoryFilterForm({value, onChange, includeQuickFilters = false}: Props) {
    return (
        <Flex direction="column" gap={3}>
            <Flex direction="column" gap={2}>
                <Text variant="subheader-1">{i18n('context_operation-date')}</Text>
                <QueryDateFilter value={value} onChange={onChange} />
            </Flex>
            <Flex direction="column" gap={2}>
                <Text variant="subheader-1">{i18n('context_operation-owner')}</Text>
                {includeQuickFilters && (
                    <QueryFastUserFilter value={value.user} onUpdate={(user) => onChange({user})} />
                )}
                <QueryUserFilter value={value.user} onUpdate={(user) => onChange({user})} />
            </Flex>
            {includeQuickFilters && (
                <Flex direction="column" gap={2}>
                    <Text variant="subheader-1">{engineI18n('context_select-engine')}</Text>
                    <QueryEngineFilter
                        value={value.engine}
                        onUpdate={(engine) => onChange({engine})}
                    />
                </Flex>
            )}
            <Flex direction="column" gap={2}>
                <Text variant="subheader-1">{i18n('context_query-state')}</Text>
                <QueryStateFilter value={value.state} onUpdate={(state) => onChange({state})} />
            </Flex>
        </Flex>
    );
}
