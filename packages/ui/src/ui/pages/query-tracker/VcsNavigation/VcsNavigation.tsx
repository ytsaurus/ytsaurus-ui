import React, {FC} from 'react';
import {VcsNavigationHeader} from './VcsNavigationHeader';
import {VcsItemsList} from './VcsItemsList';
import './VcsNavigation.scss';
import cn from 'bem-cn-lite';

const block = cn('vsc-navigation');

export const VcsNavigation: FC = () => {
    return (
        <div className={block()}>
            <VcsNavigationHeader />
            <VcsItemsList />
        </div>
    );
};
