import React from 'react';
import block from 'bem-cn-lite';
import {ControlGroupOption, Icon as GravityIcon, RadioButton, Tooltip} from '@gravity-ui/uikit';
import {
    QueriesListAuthorFilter,
    QueriesListFilter,
    QueriesListMode,
} from '../../module/queries_list/types';
import CircleQuestionIcon from '@gravity-ui/icons/svgs/circle-question.svg';

import './index.scss';
import {QueryEngineFilter} from './QueryEngineFilter';
import {QueryEngine} from '../../../../../shared/constants/engines';
import Dropdown from '../../../../components/Dropdown/Dropdown';
import Button from '../../../../components/Button/Button';
import Icon from '../../../../components/Icon/Icon';
import ColumnSelector from '../../../../components/ColumnSelector/ColumnSelector';
import {useDispatch, useSelector} from 'react-redux';
import {
    getQueriesFilters,
    getQueriesListMode,
    getQueryListColumns,
} from '../../module/queries_list/selectors';
import {applyFilter} from '../../module/queries_list/actions';
import {setSettingByKey} from '../../../../store/actions/settings';
import TextInputWithDebounce from '../../../../components/TextInputWithDebounce/TextInputWithDebounce';

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
    const dispatch = useDispatch();
    const filter = useSelector(getQueriesFilters);
    const filterViewMode = useSelector(getQueriesListMode);
    const {allowedColumns} = useSelector(getQueryListColumns);

    const handleColumnChange = (selectedColumns: {
        items: Array<{checked: boolean; name: string}>;
    }) => {
        dispatch(
            setSettingByKey(
                `global::queryTracker::history::Columns`,
                selectedColumns.items.filter(({checked}) => checked).map(({name}) => name),
            ),
        );
    };

    const setFilter = React.useMemo(
        () => ({
            user: (value: string) => {
                dispatch(applyFilter({user: value as QueriesListFilter['user']}));
            },
            engine: (value?: QueryEngine) => {
                dispatch(applyFilter({engine: value as QueriesListFilter['engine']}));
            },
            filter: (value?: string) => {
                dispatch(applyFilter({filter: value as QueriesListFilter['filter']}));
            },
        }),
        [dispatch],
    );

    return (
        <div className={b(null, className)}>
            <div className={b('row')}>
                {filterViewMode === QueriesListMode.History && (
                    <RadioButton
                        options={AuthorFilter}
                        value={filter?.user || QueriesListAuthorFilter.My}
                        onUpdate={setFilter.user}
                    />
                )}
                <QueryEngineFilter value={filter?.engine} onChange={setFilter.engine} />
            </div>
            {filterViewMode === QueriesListMode.History && (
                <div className={b('row')}>
                    <TextInputWithDebounce
                        placeholder="Search in query name, body and access control"
                        value={filter?.filter}
                        onUpdate={setFilter.filter}
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
                        <GravityIcon data={CircleQuestionIcon} size={16} />
                    </Tooltip>
                    <Dropdown
                        trigger="click"
                        directions={['bottom']}
                        button={
                            <Button pin={'round-round'} className={b('columns-button')}>
                                <Icon awesome="table" face="light" />
                            </Button>
                        }
                        template={
                            <ColumnSelector items={allowedColumns} onChange={handleColumnChange} />
                        }
                    />
                </div>
            )}
        </div>
    );
}
