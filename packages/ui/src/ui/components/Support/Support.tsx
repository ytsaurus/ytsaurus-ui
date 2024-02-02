import React from 'react';
import cn from 'bem-cn-lite';
import _ from 'lodash';

import './Support.scss';
import UIFactory from '../../UIFactory';
import {getCluster, getCurrentUserName} from '../../store/selectors/global';
import {useSelector} from 'react-redux';

interface SupportProps {
    children?: React.ReactNode;
}

const b = cn('support-form');

export function Support({children}: SupportProps) {
    const login = useSelector(getCurrentUserName);
    const cluster = useSelector(getCluster);

    const makeContent = React.useCallback(
        ({
            supportContent,
            onSupportClick,
        }: {
            supportContent?: React.ReactNode;
            onSupportClick: () => void;
        }) => (
            <div className={b()} onClick={onSupportClick}>
                {supportContent}
                {children || (
                    <div className={b('toggler')}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="45"
                            height="32"
                            viewBox="0 0 45 32"
                        >
                            <defs>
                                <linearGradient id="moo_bg" x1="0" x2="0" y1="0" y2="1">
                                    <stop className="moo-bg__start" offset="0%" stopColor="#fff" />
                                    <stop className="moo-bg__stop" offset="100%" stopColor="#eee" />
                                </linearGradient>
                            </defs>
                            <path
                                className={b('toggler-back')}
                                d="M-0.5 0h36l8 16l-8 16.5h-36z"
                                fill="url(#moo_bg)"
                                strokeWidth="1"
                                stroke="rgba(0,0,0,0.25)"
                            />
                        </svg>
                        <span className={b('toggler-moo')} />
                    </div>
                )}
            </div>
        ),
        [children],
    );

    return UIFactory.makeSupportContent({login, cluster}, makeContent) || null;
}
