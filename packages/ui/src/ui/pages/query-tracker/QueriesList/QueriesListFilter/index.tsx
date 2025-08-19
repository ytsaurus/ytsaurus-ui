import React from 'react';
import block from 'bem-cn-lite';
import {Icon, Tooltip} from '@gravity-ui/uikit';
import {QueriesListFilter, QueriesListMode} from '../../module/queries_list/types';
import CircleQuestionIcon from '@gravity-ui/icons/svgs/circle-question.svg';
import FunnelIcon from '@gravity-ui/icons/svgs/funnel.svg';

import './index.scss';
import {QueryEngineFilter} from './QueryEngineFilter';
import Dropdown from '../../../../components/Dropdown/Dropdown';
import Button from '../../../../components/Button/Button';
import GearIcon from '@gravity-ui/icons/svgs/gear.svg';
import ColumnSelector from '../../../../components/ColumnSelector/ColumnSelector';
import {useDispatch, useSelector} from 'react-redux';
import {
    getQueriesFilters,
    getQueriesListMode,
    getQueryListColumns,
    hasCustomHistoryFilters,
} from '../../module/queries_list/selectors';
import {applyFilter} from '../../module/queries_list/actions';
import {setSettingByKey} from '../../../../store/actions/settings';
import TextInputWithDebounce from '../../../../components/TextInputWithDebounce/TextInputWithDebounce';
import {FilterDropdown} from './FilterDropdown';
import {QueryFastUserFilter} from './QueryFastUserFilter';

const b = block('queries-history-filter');

type QueriesHistoryListFilterProps = {
    className?: string;
};

export function QueriesHistoryListFilter({className}: QueriesHistoryListFilterProps) {
    const dispatch = useDispatch();
    const filter = useSelector(getQueriesFilters);
    const filterViewMode = useSelector(getQueriesListMode);
    const {allowedColumns} = useSelector(getQueryListColumns);
    const customFilterChanged = useSelector(hasCustomHistoryFilters);

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

    const handleFilterChange = (value: string) => {
        dispatch(applyFilter({filter: value as QueriesListFilter['filter']}));
    };

    const isHistory = filterViewMode === QueriesListMode.History;

    if (!isHistory) {
        return (
            <div className={b(null, className)}>
                <div className={b('row')}>
                    <QueryEngineFilter />
                </div>
            </div>
        );
    }

    return (
        <div className={b(null, className)}>
            <div className={b('row')}>
                <QueryFastUserFilter />
                <QueryEngineFilter />

                <Dropdown
                    trigger="click"
                    directions={['bottom']}
                    button={
                        <Button
                            view={customFilterChanged ? 'outlined-info' : 'outlined'}
                            tooltipProps={{content: 'Additional filters'}}
                            withTooltip
                        >
                            <Icon data={FunnelIcon} size={16} />
                        </Button>
                    }
                    template={<FilterDropdown />}
                />
                <Dropdown
                    trigger="click"
                    directions={['bottom']}
                    button={
                        <Button tooltipProps={{content: 'Table column settings'}} withTooltip>
                            <Icon data={GearIcon} size={16} />
                        </Button>
                    }
                    template={
                        <ColumnSelector items={allowedColumns} onChange={handleColumnChange} />
                    }
                />
            </div>

            <div className={b('row')}>
                <TextInputWithDebounce
                    placeholder="Search in query name, body and access control"
                    value={filter?.filter}
                    onUpdate={handleFilterChange}
                />
                <Tooltip
                    content={
                        <>
                            Search in query text, annotations and access control
                            <br />
                            Use `&quot;title&quot;=&quot;test_name&quot;` to search in query name
                            <br />
                            Use `aco:nobody` to search in query access control
                        </>
                    }
                >
                    <Icon data={CircleQuestionIcon} size={16} />
                </Tooltip>
            </div>
        </div>
    );
}
