import React from 'react';
import PropTypes from 'prop-types';
import block from 'bem-cn-lite';

import Icon from '../Icon/Icon';

import './ErrorMessage.scss';

const b = block('error-message');

function ErrorMessage({message, className}) {
    return (
        <div className={b(null, className)}>
            <Icon awesome="exclamation-circle" />

            <span className={b('message-text')}>{message}</span>
        </div>
    );
}

ErrorMessage.propTypes = {
    message: PropTypes.string.isRequired,
    className: PropTypes.string,
};

export default ErrorMessage;
