import React, {FC} from 'react';
import {Text} from '@gravity-ui/uikit';
import './NavigationEmpty.scss';
import cn from 'bem-cn-lite';

const b = cn('navigation-empty');

export const NavigationEmpty: FC = () => {
    return (
        <div className={b()}>
            <Text variant="subheader-2">This directory is empty</Text>
        </div>
    );
};
