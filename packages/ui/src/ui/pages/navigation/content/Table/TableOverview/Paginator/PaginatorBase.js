import React from 'react';
import PropTypes from 'prop-types';

import i18n from '../i18n';

import Pagination from '../../../../../../components/Pagination/Pagination';

PaginatorBase.propTypes = {
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

export function PaginatorBase(props) {
    const {block, error, isPaginationDisabled, isTableEndReached, offsetValue, isDynamic} = props;
    const {moveOffsetToStart, moveOffsetToLeft, moveOffsetToRight, moveOffsetToEnd} = props;
    const tooltip = isPaginationDisabled ? i18n('context_pagination-disabled') : undefined;
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
