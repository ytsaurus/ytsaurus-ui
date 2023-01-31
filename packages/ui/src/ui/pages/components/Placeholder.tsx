import React from 'react';
import block from 'bem-cn-lite';
import {useRouteMatch} from 'react-router';

import hammer from '../../common/hammer';

const b = block('elements-message');

interface MatchParams {
    tab: string;
}

export default function Placeholder() {
    const match = useRouteMatch<MatchParams>();
    const {tab} = match.params;

    return (
        <div className={b({theme: 'warning'})}>
            <p className={b('paragraph')}>
                {tab
                    ? `Viewer for tab "${hammer.format['ReadableField'](tab)}" is not implemented.`
                    : 'Viewer for this tab is not implemented.'}
            </p>
        </div>
    );
}
