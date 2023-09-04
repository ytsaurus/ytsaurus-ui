import React from 'react';
import block from 'bem-cn-lite';

import './NodeQuad.scss';
const b = block('node-quad');

const defaultProps = {
    theme: 'unknown',
};

interface Props {
    theme?:
        | 'online'
        | 'banned'
        | 'offline'
        | 'following'
        | 'mixed'
        | 'registered'
        | 'unregistered'
        | 'nonvoting'
        | 'unknown';
}

export default function NodeQuad({theme}: Props) {
    return <div className={b({theme})} />;
}

NodeQuad.defaultProps = defaultProps;
