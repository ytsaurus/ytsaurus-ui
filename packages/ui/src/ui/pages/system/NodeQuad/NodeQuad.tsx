import block from 'bem-cn-lite';
import React from 'react';

import './NodeQuad.scss';
const b = block('node-quad');

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
    theme?: NodeQuadTheme;
    children?: string;
    banned?: boolean;
    alerts?: boolean;
    decommissioned?: boolean;
    full?: boolean;
}

export default function NodeQuad({
    theme = 'unknown',
    children = '',
    banned,
    alerts,
    decommissioned,
    full,
}: Props) {
    const text = (alerts && 'A') || (decommissioned && 'D') || (full && 'F') || undefined;
    const bannedOrTheme = banned ? ('banned' as const) : theme;

    const effectiveTheme = children ? `${bannedOrTheme}-letter` : theme;
    return <div className={b({theme: effectiveTheme, full})}>{text}</div>;
}
