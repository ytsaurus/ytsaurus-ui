import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import Pagination from '../../../../../components/Pagination/Pagination';

import {getIsDynamic} from '../../../../../store/selectors/navigation/content/table-ts';
import {
    getIsPaginationDisabled,
    getIsTableEndReached,
    getOffsetValue,
} from '../../../../../store/selectors/navigation/content/table';
import {
    moveOffsetToEnd,
    moveOffsetToLeft,
    moveOffsetToRight,
    moveOffsetToStart,
} from '../../../../../store/actions/navigation/content/table/pagination';

Paginator.propTypes = {
    // from parent
    block: PropTypes.func.isRequired,

    // from connect
    error: PropTypes.bool.isRequired,

    isPaginationDisabled: PropTypes.bool.isRequired,
    isTableEndReached: PropTypes.bool.isRequired,
    isDynamic: PropTypes.bool.isRequired,

    previousOffset: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    offsetValue: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

    moveOffsetToStart: PropTypes.func.isRequired,
    moveOffsetToLeft: PropTypes.func.isRequired,
    moveOffsetToRight: PropTypes.func.isRequired,
    moveOffsetToEnd: PropTypes.func.isRequired,
};

function Paginator(props) {
    const {block, error, isPaginationDisabled, isTableEndReached, offsetValue, isDynamic} = props;
    const {moveOffsetToStart, moveOffsetToLeft, moveOffsetToRight, moveOffsetToEnd} = props;
    const tooltip = isPaginationDisabled
        ? 'Select every key column in Column Selector to enable pagination'
        : undefined;
    // TODO: use when descending sorting will be implemented on backend

    return (
        <Pagination
            size="m"
            tooltip={tooltip}
            className={block('pagination')}
            first={{
                handler: moveOffsetToStart,
                hotkeyHandler: moveOffsetToStart,
                hotkeyScope: 'all',
                hotkey: 'ctrl+shift+left, command+shift+left',
                disabled: !offsetValue || isPaginationDisabled,
            }}
            previous={{
                handler: moveOffsetToLeft,
                hotkeyHandler: moveOffsetToLeft,
                hotkeyScope: 'all',
                hotkey: 'ctrl+left, command+left',
                disabled: isDynamic || !offsetValue || isPaginationDisabled,
                // disabled: isDynamic && error || moveBackwardDisabled || !offsetValue || isPaginationDisabled,
            }}
            next={{
                handler: moveOffsetToRight,
                hotkeyHandler: moveOffsetToRight,
                hotkeyScope: 'all',
                hotkey: 'ctrl+right, command+right',
                disabled: (isDynamic && error) || isTableEndReached || isPaginationDisabled,
            }}
            last={{
                handler: moveOffsetToEnd,
                hotkeyHandler: moveOffsetToEnd,
                hotkeyScope: 'all',
                hotkey: 'ctrl+shift+right, command+shift+right',
                disabled: isDynamic || isTableEndReached || isPaginationDisabled,
                // disabled: isTableEndReached || moveBackwardDisabled || isPaginationDisabled,
            }}
        />
    );
}

const mapStateToProps = (state) => {
    const {error} = state.navigation.content.table;

    const isPaginationDisabled = getIsPaginationDisabled(state);
    const isTableEndReached = getIsTableEndReached(state);
    const offsetValue = getOffsetValue(state);
    const isDynamic = getIsDynamic(state);

    return {
        error,
        isDynamic,
        offsetValue,
        isPaginationDisabled,
        isTableEndReached,
    };
};

const mapDispatchToProps = {
    moveOffsetToStart,
    moveOffsetToLeft,
    moveOffsetToRight,
    moveOffsetToEnd,
};

export default connect(mapStateToProps, mapDispatchToProps)(Paginator);
