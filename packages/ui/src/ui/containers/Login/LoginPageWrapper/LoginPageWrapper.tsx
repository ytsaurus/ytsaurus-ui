import React from 'react';

import LogoLight from '../../../assets/img/svg/YTsaurus-logo-light.svg';
import LogoDark from '../../../assets/img/svg/YTsaurus-logo-dark.svg';

import cn from 'bem-cn-lite';

const block = cn('login-page');

import '../../../containers/App/App.scss';
import './LoginPageWrapper.scss';

interface Props {
    theme?: 'light' | 'dark';
    children: React.ReactNode;
}

function LoginPageWrapper({theme, children}: Props) {
    return (
        <div className={block(null)}>
            {theme === 'light' ? (
                <LogoLight className={block('logo')} />
            ) : (
                <LogoDark className={block('logo')} />
            )}
            <div className={block('content')}>{children}</div>
        </div>
    );
}

export default React.memo(LoginPageWrapper);
