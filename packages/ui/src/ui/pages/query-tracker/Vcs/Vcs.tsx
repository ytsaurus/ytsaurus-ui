import React, {FC} from 'react';
import {VcsHeader} from './VcsHeader';
import {VcsItemsList} from './VcsItemsList';
import './Vcs.scss';
import cn from 'bem-cn-lite';

const block = cn('vsc');

export const Vcs: FC = () => {
    return (
        <div className={block()}>
            <VcsHeader />
            <VcsItemsList />
        </div>
    );
};
