import React from 'react';
import block from 'bem-cn-lite';
import {useRouteMatch} from 'react-router';

import hammer from '../../common/hammer';
import i18n from './i18n';

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
                    ? i18n('alert_tab-not-implemented', {tab: hammer.format['ReadableField'](tab)})
                    : i18n('alert_unknown-tab-not-implemented')}
            </p>
        </div>
    );
}
