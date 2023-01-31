import React from 'react';
import cn from 'bem-cn-lite';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import {setGroupsNameFilter} from '../../../store/actions/groups';
import ErrorBoundary from '../../../components/ErrorBoundary/ErrorBoundary';
import Filter from '../../../components/Filter/Filter';
import {Toolbar} from '../../../components/WithStickyToolbar/Toolbar/Toolbar';
import {getGroupsNameFilter} from '../../../store/selectors/groups';

import './GroupsPageFilters.scss';

const block = cn('groups-page-filters');

class GroupsPageFilters extends React.Component {
    static propTypes = {
        className: PropTypes.string,

        groupFilter: PropTypes.string,

        setGroupsNameFilter: PropTypes.func,
    };

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
                />
            </ErrorBoundary>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        groupFilter: getGroupsNameFilter(state),
    };
};

const mapDispatchToProps = {
    setGroupsNameFilter,
};

export default connect(mapStateToProps, mapDispatchToProps)(GroupsPageFilters);
