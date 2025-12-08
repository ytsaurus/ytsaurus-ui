import React from 'react';
import block from 'bem-cn-lite';
import {Icon, Tooltip} from '@gravity-ui/uikit';
import {QueriesListFilter, QueriesListMode} from '../../../../types/query-tracker/queryList';
import CircleQuestionIcon from '@gravity-ui/icons/svgs/circle-question.svg';
import FunnelIcon from '@gravity-ui/icons/svgs/funnel.svg';

import './index.scss';
import {QueryEngineFilter} from './QueryEngineFilter';
import Dropdown from '../../../../components/Dropdown/Dropdown';
import Button from '../../../../components/Button/Button';
import GearIcon from '@gravity-ui/icons/svgs/gear.svg';
import ColumnSelector from '../../../../components/ColumnSelector/ColumnSelector';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {
    getQueriesFilters,
    getQueriesListMode,
    getQueryListColumns,
    hasCustomHistoryFilters,
} from '../../../../store/selectors/query-tracker/queriesList';
import {applyFilter} from '../../../../store/actions/query-tracker/queriesList';
import {setSettingByKey} from '../../../../store/actions/settings';
import TextInputWithDebounce from '../../../../components/TextInputWithDebounce/TextInputWithDebounce';
import {FilterDropdown} from './FilterDropdown';
import {QueryFastUserFilter} from './QueryFastUserFilter';
import i18n from './i18n';

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
                            tooltipProps={{content: i18n('context_additional-filters')}}
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
                        <Button
                            tooltipProps={{content: i18n('context_table-column-settings')}}
                            withTooltip
                        >
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
                    placeholder={i18n('context_search-placeholder')}
                    value={filter?.filter}
                    onUpdate={handleFilterChange}
                />
                <Tooltip
                    content={
                        <>
                            {i18n('context_search-hint-title')}
                            <br />
                            {i18n('context_search-hint-name')}
                            <br />
                            {i18n('context_search-hint-aco')}
                        </>
                    }
                >
                    <Icon data={CircleQuestionIcon} size={16} />
                </Tooltip>
            </div>
        </div>
    );
}
