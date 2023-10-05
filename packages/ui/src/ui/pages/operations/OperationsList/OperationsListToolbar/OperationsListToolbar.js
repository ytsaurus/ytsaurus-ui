import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';
import _ from 'lodash';

import {getAllUserNames} from '../../../../store/selectors/global';
import OperationsTextFilter from './OperationsTextFilter';
import OperationsArchiveFilter from './OperationsArchiveFilter';
import OperationsSelectFilter from './OperationsSelectFilter';

import OperationsListPaginator from './OperationsListPaginator';
import OperationsFilterPresets from './OperationsFilterPresets';
import {
    toggleSaveFilterPresetDialog,
    updateFilter,
} from '../../../../store/actions/operations/list';

import {
    OperationsAccessibleForFilter,
    OperationsListPoolSuggestFilter,
    OperationsListPoolTreeSuggestFilter,
    OperationsListUserSuggestFilter,
} from '../../../../pages/operations/OperationsList/OperationsListToolbar/OperationsListSuggestFilters';
import {getOperationsListFixedStartedByFilter_FOR_YTFRONT_2838} from '../../../../store/selectors/operations';
import Button, {SelectButton} from '../../../../components/Button/Button';
import Icon from '../../../../components/Icon/Icon';
import {PoolTreesLoader} from '../../../../hooks/global';

import './OperationsListToolbar.scss';

const block = cn('operations-list');
const tbBlock = cn('elements-toolbar');
const tbComp = tbBlock('component');

class OperationsListToolbar extends React.PureComponent {
    static propTypes = {
        // from connect
        updateFilter: PropTypes.func.isRequired,
        toggleSaveFilterPresetDialog: PropTypes.func.isRequired,
        failedJobsFilter: PropTypes.shape({
            type: PropTypes.string.isRequired,
            defaultValue: PropTypes.bool.isRequired,
            value: PropTypes.bool,
        }).isRequired,
        subjects: PropTypes.arrayOf(PropTypes.string).isRequired,
        // from props
        inDashboard: PropTypes.bool,
    };

    preparePermissionsPlaceholder(permissions) {
        if (permissions.length === 0) {
            return 'Select...';
        }

        const labels = _.map(permissions, (permission) => permission[0].toUpperCase());

        return labels.join(', ');
    }

    renderTopSection() {
        return (
            <div className={tbBlock('container')}>
                <OperationsTextFilter />

                <div className={block('toolbar-pool-filter', tbComp)}>
                    <PoolTreesLoader />
                    <OperationsListPoolTreeSuggestFilter pin="round-clear" />
                    <OperationsListPoolSuggestFilter pin="brick-round" />
                </div>

                <OperationsArchiveFilter />

                <div className={block('toolbar-pagination', tbComp)}>
                    <OperationsListPaginator />
                </div>
            </div>
        );
    }

    renderBottomSection() {
        const {failedJobsFilter, updateFilter, toggleSaveFilterPresetDialog} = this.props;

        return (
            <div className={tbBlock('container')}>
                <div className={block('toolbar-user-filter', tbComp)}>
                    <OperationsListUserSuggestFilter />
                </div>

                <div className={block('toolbar-access-filters', tbComp)}>
                    <OperationsAccessibleForFilter pin="round-clear" />
                    <OperationsSelectFilter
                        type="check"
                        name="permissions"
                        withCounters={false}
                        placeholder={this.preparePermissionsPlaceholder}
                        states={[
                            {
                                name: 'read',
                                show: true,
                            },
                            {
                                name: 'manage',
                                show: true,
                            },
                        ]}
                        width={170}
                        multiple
                        pin="brick-round"
                    />
                </div>

                <div className={block('toolbar-state-filter', tbComp)}>
                    <OperationsSelectFilter
                        name="state"
                        states={[
                            {
                                name: 'all',
                                caption: 'All states',
                                show: true,
                            },
                            {
                                name: 'pending',
                                show: true,
                            },
                            {
                                name: 'running',
                                show: true,
                            },
                            {
                                name: 'completed',
                                show: true,
                            },
                            {
                                name: 'failed',
                                show: true,
                            },
                            {
                                name: 'aborted',
                                show: true,
                            },
                        ]}
                        width={200}
                    />
                </div>

                <div className={block('toolbar-type-filter', tbComp)}>
                    <OperationsSelectFilter
                        name="type"
                        states={[
                            {
                                name: 'all',
                                caption: 'All types',
                                show: true,
                            },
                            {
                                name: 'map',
                                show: true,
                            },
                            {
                                name: 'reduce',
                                show: true,
                            },
                            {
                                name: 'map_reduce',
                                show: true,
                            },
                            {
                                name: 'join_reduce',
                                show: true,
                            },
                            {
                                name: 'merge',
                                show: true,
                            },
                            {
                                name: 'sort',
                                show: true,
                            },
                            {
                                name: 'erase',
                                show: true,
                            },
                            {
                                name: 'remote_copy',
                                show: true,
                            },
                            {
                                name: 'vanilla',
                                show: true,
                            },
                        ]}
                        width={200}
                    />
                </div>

                <div className={block('failed-jobs', tbComp)}>
                    <SelectButton
                        selected={failedJobsFilter.value}
                        onClick={() => updateFilter('failedJobs', !failedJobsFilter.value)}
                    >
                        Only ops with failed jobs:{' '}
                        <span className={block('only-jobs-with-failed-counter')}>
                            {failedJobsFilter.counter}
                        </span>
                    </SelectButton>
                </div>

                <div className={block('toolbar-save-preset', tbComp)}>
                    <Button
                        title="Save filter"
                        onClick={toggleSaveFilterPresetDialog}
                        className={block('save-preset')}
                    >
                        <Icon awesome={'save'} face={'regular'} />
                        &nbsp; Save filter
                    </Button>
                </div>
            </div>
        );
    }

    renderWarning_uiissue_2838() {
        return (
            <div className={block('ytfront-2383')}>
                At the moment there is the unresolved performance issue with getting unfiltered list
                of operations from archive,
                <br />
                as a temporary solution UI adds current username to &quot;Started by&quot; filter if
                there are no any other filters specified.
            </div>
        );
    }

    render() {
        const {fixedStartedByFilter} = this.props;

        return (
            <div className={block('toolbar', tbBlock())}>
                {this.renderTopSection()}
                {this.renderBottomSection()}
                {fixedStartedByFilter && this.renderWarning_uiissue_2838()}
                <OperationsFilterPresets />
            </div>
        );
    }
}

function OperationsListToolbarHooked() {
    const subjects = useSelector(getAllUserNames);
    const {failedJobs} = useSelector((state) => state.operations.list.filters) || {};
    const fixedStartedByFilter = useSelector(
        getOperationsListFixedStartedByFilter_FOR_YTFRONT_2838,
    );

    const dispatch = useDispatch();
    const handleUpdateFilter = React.useCallback(
        (...args) => {
            dispatch(updateFilter(...args));
        },
        [dispatch],
    );

    const handleToggleSaveFilterPresetDialog = React.useCallback(
        (...args) => {
            dispatch(toggleSaveFilterPresetDialog(...args));
        },
        [dispatch],
    );

    return (
        <OperationsListToolbar
            {...{
                subjects,
                failedJobsFilter: failedJobs,
                fixedStartedByFilter,
            }}
            updateFilter={handleUpdateFilter}
            toggleSaveFilterPresetDialog={handleToggleSaveFilterPresetDialog}
        />
    );
}

export default React.memo(OperationsListToolbarHooked);
