import React from 'react';
import block from 'bem-cn-lite';
import './EmptyPlaceholdersMessage.scss';

const b = block('empty-placeholders-message');

export function EmptyPlaceholdersMessage() {
    return <div className={b()}>Add fields in X and Y placeholders</div>;
}
