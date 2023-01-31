// import {Tabs} from '@gravity-ui/uikit';
import React from 'react';
import block from 'bem-cn-lite';
import {QueriesHistoryList} from '../QueriesHistoryList';

import './index.scss';

const b = block('queires-list');

export function QueriesList() {
    return (
        <div className={b()}>
            <div className={b('content')}>
                <QueriesHistoryList />
            </div>
        </div>
    );
}
