import React from 'react';
import {Flex, Text} from '@gravity-ui/uikit';
import type {QueriesListFilter} from '../../../../../types/query-tracker/queryList';
import {QueryDateFilterField} from '../QueryDateFilter/QueryDateFilter';
import {QueryUserFilterField} from '../QueryUserFilter/QueryUserFilter';
import {QueryStateFilterField} from '../QueryStateFilter/QueryStateFilter';
import {QueryEngineFilterField} from '../QueryEngineFilter/QueryEngineFilter';
import i18n from '../FilterDropdown/i18n';
import listI18n from '../../i18n';

export type HistoryFilterValue = Pick<
    QueriesListFilter,
    'from' | 'to' | 'user' | 'state' | 'engine'
>;
type Props = {
    value: HistoryFilterValue;
    onChange: (value: HistoryFilterValue) => void;
    showEngine?: boolean;
};

export function QueryHistoryFilterFields({value, onChange, showEngine = true}: Props) {
    return (
        <Flex direction="column" gap={3}>
            <Flex direction="column" gap={2}>
                <Text variant="subheader-1">{i18n('context_operation-date')}</Text>
                <QueryDateFilterField
                    value={{from: value.from, to: value.to}}
                    onChange={(range) => onChange({...value, ...range})}
                />
            </Flex>
            <Flex direction="column" gap={2}>
                <Text variant="subheader-1">{i18n('context_operation-owner')}</Text>
                <QueryUserFilterField
                    value={value.user}
                    onChange={(user) => onChange({...value, user})}
                />
            </Flex>
            <Flex direction="column" gap={2}>
                <Text variant="subheader-1">{i18n('context_query-state')}</Text>
                <QueryStateFilterField
                    value={value.state}
                    onChange={(state) => onChange({...value, state})}
                />
            </Flex>
            {showEngine && (
                <Flex direction="column" gap={2}>
                    <Text variant="subheader-1">{listI18n('filter_engine')}</Text>
                    <QueryEngineFilterField
                        value={value.engine}
                        onChange={(engine) => onChange({...value, engine})}
                    />
                </Flex>
            )}
        </Flex>
    );
}
