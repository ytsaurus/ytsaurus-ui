import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

import Pagination from '../../../../../../components/Pagination/Pagination';
import {gotoJobsPage} from '../../../../../../store/actions/operations/jobs';
import {OPERATIONS_PAGE} from '../../../../../../constants/operations';

class JobsPaginator extends React.Component {
    static propTypes = {
        disabled: PropTypes.bool,
        firstPageReached: PropTypes.bool.isRequired,
        lastPageReached: PropTypes.bool.isRequired,
        gotoJobsPage: PropTypes.func.isRequired,
    };

    gotoFirstPage = () => this.props.gotoJobsPage(OPERATIONS_PAGE.FIRST);
    gotoNextPage = () => this.props.gotoJobsPage(OPERATIONS_PAGE.NEXT);
    gotoPrevPage = () => this.props.gotoJobsPage(OPERATIONS_PAGE.PREV);

    render() {
        const {firstPageReached, lastPageReached, disabled} = this.props;

        return (
            <Pagination
                size="s"
                first={{
                    handler: this.gotoFirstPage,
                    disabled: disabled || firstPageReached,
                }}
                previous={{
                    handler: this.gotoPrevPage,
                    hotkeyHandler: this.gotoPrevPage,
                    disabled: disabled || firstPageReached,
                    hotkeyScope: 'all',
                    hotkey: 'ctrl+left, command+left',
                }}
                next={{
                    handler: this.gotoNextPage,
                    hotkeyHandler: this.gotoNextPage,
                    disabled: disabled || lastPageReached,
                    hotkeyScope: 'all',
                    hotkey: 'ctrl+right, command+right',
                }}
                last={{disabled: true}}
            />
        );
    }
}

function mapStateToProps({operations}) {
    const {firstPageReached, lastPageReached, limit, offset} = operations.jobs.pagination;
    return {firstPageReached, lastPageReached, limit, offset};
}

export default connect(mapStateToProps, {gotoJobsPage})(JobsPaginator);
