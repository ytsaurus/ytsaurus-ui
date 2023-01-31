import React from 'react';
import cn from 'bem-cn-lite';
import PropTypes from 'prop-types';

import './NoItemsMessage.scss';

const block = cn('no-items-message');

NoItemsMessage.propTypes = {
    className: PropTypes.string,
    visible: PropTypes.bool,
};

export function NoItemsMessage({className, visible}) {
    if (!visible) {
        return null;
    }

    return <div className={block(null, className)}>No items to show</div>;
}
