import React from 'react';
import block from 'bem-cn-lite';

import Icon from '../Icon/Icon';

import './ErrorMessage.scss';

const b = block('error-message');

export type ErrorMessageProps = {message: string; className?: string};

function ErrorMessage({message, className}: ErrorMessageProps) {
    return (
        <div className={b(null, className)}>
            <Icon awesome="exclamation-circle" />

            <span className={b('message-text')}>{message}</span>
        </div>
    );
}

export default ErrorMessage;
