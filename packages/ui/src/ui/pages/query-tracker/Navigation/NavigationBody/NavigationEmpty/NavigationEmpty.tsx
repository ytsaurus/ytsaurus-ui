import React, {FC} from 'react';
import {Text} from '@gravity-ui/uikit';
import './NavigationEmpty.scss';
import cn from 'bem-cn-lite';
import i18n from './i18n';

const b = cn('navigation-empty');

export const NavigationEmpty: FC = () => {
    return (
        <div className={b()}>
            <Text variant="subheader-2">{i18n('context_empty-directory')}</Text>
        </div>
    );
};
