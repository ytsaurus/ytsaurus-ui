import React, {useCallback} from 'react';
import block from 'bem-cn-lite';
import {ControlGroupOption, Icon, RadioButton, Tooltip} from '@gravity-ui/uikit';
import {QueriesListAuthorFilter, QueriesListMode} from '../../module/queries_list/types';
import CircleQuestionIcon from '@gravity-ui/icons/svgs/circle-question.svg';

import './index.scss';
import {QueryEngineFilter} from './QueryEngineFilter';
import {QueryEngine} from '../../module/engines';
import {QueryTextFilter} from './QueryTextFilter';
import {useQuriesHistoryFilter} from '../../hooks/QueryListFilter';

const AuthorFilter: ControlGroupOption[] = [
    {
        value: QueriesListAuthorFilter.My,
        content: 'My',
    },
    {
        value: QueriesListAuthorFilter.All,
        content: 'All',
    },
];

const b = block('queries-history-filter');

type QueriesHistoryListFilterProps = {
    className?: string;
};
export function QueriesHistoryListFilter({className}: QueriesHistoryListFilterProps) {
    const [filter, filterViewMode, onChange] = useQuriesHistoryFilter();

    const onChangeAuthorFilter = useCallback(
        (user: string) => {
            onChange('user', user as QueriesListAuthorFilter);
        },
        [onChange],
    );
    const onChangeEngineFilter = useCallback(
        (engine?: QueryEngine) => {
            onChange('engine', engine);
        },
        [onChange],
    );
    const onChangeTextFilter = useCallback(
        (text?: string) => {
            onChange('filter', text || undefined);
        },
        [onChange],
    );
    return (
        <div className={b(null, className)}>
            <div className={b('row')}>
                {filterViewMode === QueriesListMode.History && (
                    <RadioButton
                        options={AuthorFilter}
                        value={filter?.user || QueriesListAuthorFilter.My}
                        onUpdate={onChangeAuthorFilter}
                    />
                )}
                <QueryEngineFilter value={filter?.engine} onChange={onChangeEngineFilter} />
            </div>
            {filterViewMode === QueriesListMode.History && (
                <div className={b('row')}>
                    <QueryTextFilter
                        placeholder="Search in query name, body and access control"
                        value={filter?.filter}
                        onChange={onChangeTextFilter}
                    />
                    <Tooltip
                        content={
                            <>
                                Search in query text, annotations and access control
                                <br />
                                Use `&quot;title&quot;=&quot;test_name&quot;` to search in query
                                name
                                <br />
                                Use `aco:nobody` to search in query access control
                            </>
                        }
                    >
                        <Icon data={CircleQuestionIcon} size={16} />
                    </Tooltip>
                </div>
            )}
        </div>
    );
}
