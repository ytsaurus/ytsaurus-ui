import React from 'react';
import UIFactory from '../../../UIFactory';
import YT from '../../../config/yt-config';

import DefaultLoginLogo from './DefaultLoginLogo';

import cn from 'bem-cn-lite';

const block = cn('login-page');

import '../../../containers/App/App.scss';
import './LoginPageWrapper.scss';

interface Props {
    theme?: 'light' | 'dark';
    children: React.ReactNode;
}

function LoginPageWrapper({theme, children}: Props) {
    const {LoginLogo = DefaultLoginLogo} = UIFactory.getClusterAppearance(YT.cluster) || {};

    return (
        <div className={block(null)}>
            <LoginLogo theme={theme} />
            <div className={block('content')}>{children}</div>
        </div>
    );
}

export default React.memo(LoginPageWrapper);
