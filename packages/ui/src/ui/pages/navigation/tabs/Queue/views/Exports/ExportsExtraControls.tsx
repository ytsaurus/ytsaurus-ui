import React from 'react';
import b from 'bem-cn-lite';
import {ExportsEdit} from './ExportsEdit';

import './Exports.scss';

const block = b('export-extra-controls');

export function ExportsExtraControls() {
    return (
        <>
            <div className={block('divider')} />
            <ExportsEdit />
        </>
    );
}
