import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

import Pagination from '../../../../components/Pagination/Pagination';
import {gotoOperationsPage} from '../../../../store/actions/operations';
import {OPERATIONS_PAGE} from '../../../../constants/operations';

class OperationsListPaginator extends Component {
    static propTypes = {
        // from connect
        gotoOperationsPage: PropTypes.func.isRequired,
        firstPageReached: PropTypes.bool.isRequired,
        lastPageReached: PropTypes.bool.isRequired,
    };

    gotoFirstPage = () => {
        this.props.gotoOperationsPage(OPERATIONS_PAGE.FIRST);
    };
    gotoLastPage = () => {
        this.props.gotoOperationsPage(OPERATIONS_PAGE.LAST);
    };
    gotoNextPage = () => {
        this.props.gotoOperationsPage(OPERATIONS_PAGE.NEXT);
    };
    gotoPrevPage = () => {
        this.props.gotoOperationsPage(OPERATIONS_PAGE.PREV);
    };

    render() {
        const {firstPageReached, lastPageReached} = this.props;

        return (
            <Pagination
                size="s"
                first={{
                    handler: this.gotoFirstPage,
                    disabled: firstPageReached,
                }}
                previous={{
                    handler: this.gotoPrevPage,
                    hotkeyHandler: this.gotoPrevPage,
                    hotkeyScope: 'all',
                    hotkey: 'ctrl+left, command+left',
                }}
                next={{
                    handler: this.gotoNextPage,
                    hotkeyHandler: this.gotoNextPage,
                    hotkeyScope: 'all',
                    hotkey: 'ctrl+right, command+right',
                }}
                last={{
                    handler: this.gotoLastPage,
                    disabled: lastPageReached,
                }}
            />
        );
    }
}

function mapStateToProps({operations}) {
    const {firstPageReached, lastPageReached} = operations.list.cursor;
    return {firstPageReached, lastPageReached};
}

const mapDispatchToProps = {
    gotoOperationsPage,
};

export default connect(mapStateToProps, mapDispatchToProps)(OperationsListPaginator);
