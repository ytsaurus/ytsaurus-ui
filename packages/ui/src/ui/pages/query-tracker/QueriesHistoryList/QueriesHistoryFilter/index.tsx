import React, {useCallback} from 'react';
import block from 'bem-cn-lite';
import {ControlGroupOption, RadioButton, TextInput} from '@gravity-ui/uikit';
import {QueriesHistoryAuthor} from '../../module/queries_list/types';
import {QueryEnginesNames} from '../../utils/query';
import {QueriesListState} from '../../module/queries_list/reducer';

import './index.scss';

const AuthorFilter: ControlGroupOption[] = [
    {
        value: QueriesHistoryAuthor.My,
        content: 'My',
    },
    {
        value: QueriesHistoryAuthor.All,
        content: 'All',
    },
];

const ALL_ENGINE_KEY = '__all';
const EngineFilter: ControlGroupOption[] = [
    {
        value: ALL_ENGINE_KEY,
        content: 'All',
    },
    ...Object.entries(QueryEnginesNames).map(([key, name]) => {
        return {
            value: key,
            content: name,
        };
    }),
];

const b = block('queries-history-filter');

type QuriesHistoryListFilterProps = {
    className?: string;
    filter: QueriesListState['filter'];
    onChange: <K extends keyof QueriesListState['filter']>(
        filter: K,
        value: QueriesListState['filter'][K],
    ) => void;
};
export function QuriesHistoryListFilter({
    className,
    filter,
    onChange,
}: QuriesHistoryListFilterProps) {
    const onChangeAuthorFilter = useCallback(
        (user: string) => {
            onChange('user', user as QueriesHistoryAuthor);
        },
        [onChange, filter],
    );
    const onChangeEngineFilter = useCallback(
        (engine: string) => {
            onChange('engine', engine === ALL_ENGINE_KEY ? undefined : engine);
        },
        [onChange, filter],
    );
    const onChangeTextFilter = useCallback(
        (text: string) => {
            onChange('filter', text || undefined);
        },
        [onChange, filter],
    );
    return (
        <div className={b(null, className)}>
            <div className={b('row')}>
                <RadioButton
                    className={b('row-item')}
                    options={AuthorFilter}
                    value={filter.user || QueriesHistoryAuthor.My}
                    onUpdate={onChangeAuthorFilter}
                />
                <RadioButton
                    className={b('row-item')}
                    options={EngineFilter}
                    value={filter.engine || ALL_ENGINE_KEY}
                    onUpdate={onChangeEngineFilter}
                />
            </div>
            <div className={b('row')}>
                <TextInput
                    placeholder="Search in query body"
                    value={filter?.filter}
                    onUpdate={onChangeTextFilter}
                />
            </div>
        </div>
    );
}
