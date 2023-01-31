import React from 'react';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';

import Icon from '../../components/Icon/Icon';

import './ExpandIcon.scss';

const block = cn('expand-icon');

ExpandIcon.propTypes = {
    className: PropTypes.string,

    expanded: PropTypes.bool,
    visible: PropTypes.bool,
    onClick: PropTypes.func,

    data: PropTypes.any,
};

export default function ExpandIcon({className, data, expanded, visible, onClick}) {
    const icon = expanded ? 'angle-up' : 'angle-down';
    const onClickCb = React.useCallback(() => {
        if (onClick) {
            onClick(data);
        }
    }, [data, onClick]);

    return (
        <span
            className={block(
                {visible: Boolean(visible), clickable: onClick !== undefined},
                className,
            )}
            onClick={onClickCb}
        >
            <Icon awesome={icon} />
        </span>
    );
}
