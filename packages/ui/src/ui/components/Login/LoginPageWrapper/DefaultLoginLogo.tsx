import React from 'react';

import YTsaurusLogoSvg from '../../../assets/img/svg/YTsaurus-logo.svg';

import cn from 'bem-cn-lite';

const block = cn('default-login-logo');

import './DefaultLoginLogo.scss';

interface Props {
    theme?: 'light' | 'dark';
}

const DefaultLoginLogo: React.FC<Props> = ({theme}) => (
    <YTsaurusLogoSvg className={block({theme})} />
);

export default DefaultLoginLogo;
