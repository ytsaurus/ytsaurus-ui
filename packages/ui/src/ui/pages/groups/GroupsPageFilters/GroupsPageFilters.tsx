import React from 'react';
import cn from 'bem-cn-lite';
import {connect} from 'react-redux';

import {setGroupsNameFilter} from '../../../store/actions/groups';
import ErrorBoundary from '../../../components/ErrorBoundary/ErrorBoundary';
import Filter from '../../../components/Filter/Filter';
import {Toolbar} from '../../../components/WithStickyToolbar/Toolbar/Toolbar';
import {getGroupsNameFilter} from '../../../store/selectors/groups';
import type {RootState} from '../../../store/reducers';

import './GroupsPageFilters.scss';
import {ShowCreateGroupModalButton} from '../CreateGroupModal/CreateGroupModal';

const block = cn('groups-page-filters');

type GroupsPageFiltersProps = {
    className?: string;
    groupFilter: string;
    setGroupsNameFilter: (value: string) => void;
};

class GroupsPageFilters extends React.Component<GroupsPageFiltersProps> {
    render() {
        const {className, groupFilter} = this.props;

        return (
            <ErrorBoundary>
                <Toolbar
                    className={block(null, className)}
                    itemsToWrap={[
                        {
                            name: 'group',
                            node: (
                                <Filter
                                    hasClear
                                    size="m"
                                    type="text"
                                    value={groupFilter}
                                    placeholder="Enter group..."
                                    onChange={this.props.setGroupsNameFilter}
                                />
                            ),
                            wrapperClassName: block('item'),
                        },
                    ]}
                >
                    <ShowCreateGroupModalButton />
                </Toolbar>
            </ErrorBoundary>
        );
    }
}

const mapStateToProps = (state: RootState) => {
    return {
        groupFilter: getGroupsNameFilter(state),
    };
};

const mapDispatchToProps = {
    setGroupsNameFilter,
};

export default connect(mapStateToProps, mapDispatchToProps)(GroupsPageFilters);
