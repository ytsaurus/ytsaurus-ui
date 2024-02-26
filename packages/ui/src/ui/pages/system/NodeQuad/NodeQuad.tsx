import block from 'bem-cn-lite';
import React from 'react';

import './NodeQuad.scss';
const b = block('node-quad');

const defaultProps = {
    theme: 'unknown',
};

export type NodeQuadTheme =
    | 'online'
    | 'banned'
    | 'offline'
    | 'following'
    | 'mixed'
    | 'registered'
    | 'unregistered'
    | 'nonvoting'
    | 'unknown'
    | 'other';

interface Props {
    theme?: NodeQuadTheme | `${NodeQuadTheme}-letter`;
    children?: React.ReactNode;
}

export default function NodeQuad({theme, children}: Props) {
    return <div className={b({theme})}>{children}</div>;
}

NodeQuad.defaultProps = defaultProps;
