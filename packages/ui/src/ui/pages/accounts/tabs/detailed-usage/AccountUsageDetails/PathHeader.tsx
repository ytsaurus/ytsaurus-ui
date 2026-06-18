import React from 'react';

import {Header} from './Header';
import {PageCounter} from './PageCounter';
import {UsageLoader} from './UsageLoader';
import {block} from './utils';

export const PathHeader = () => {
    return (
        <div className={block('path-header')}>
            <Header column={'path'} />
            <div className={block('path-header-loader')}>
                <UsageLoader />
            </div>
            <div className={block('path-header-page')}>
                <PageCounter />
            </div>
        </div>
    );
};
