import React, {useMemo} from 'react';
import cn from 'bem-cn-lite';

import ErrorDetails from '../ErrorDetails/ErrorDetails';
import {YTError} from '../../../@types/types';
import type {SVGIconComponentData} from '@gravity-ui/uikit/build/esm/components/Icon/types';

import NotFound from '../../assets/img/svg/il_400.svg';
import PermissionsDenied from '../../assets/img/svg/il_403.svg';

import './PageError.scss';

const block = cn('page-error');

export enum PageErrorType {
    NotFound = 'not-found',
    PermissionsDenied = 'permissions-denied',
}

const Type2Icons: Record<PageErrorType, SVGIconComponentData> = {
    [PageErrorType.NotFound]: NotFound,
    [PageErrorType.PermissionsDenied]: PermissionsDenied,
};

export interface PageErrorProps {
    type?: PageErrorType;
    // todo: Concrete type of error is unknown
    error?: YTError | object;
    title: string | React.ReactNode;
    footer?: React.ReactNode;
    // todo: Concrete type of settings is unknown
    settings?: object;
    maxCollapsedDepth?: number;
}

export const PageError: React.FC<PageErrorProps> = ({
    type = PageErrorType.NotFound,
    error,
    title,
    footer,
    settings,
    maxCollapsedDepth,
}) => {
    const iconBlock = useMemo(() => {
        if (!type || !(type in Type2Icons)) {
            return null;
        }

        const SvgIcon = Type2Icons[type];

        return (
            <div className={block('icon-container')}>
                <SvgIcon width={150} height={150} className={block('icon')} />
            </div>
        );
    }, [type]);

    const errorDetailsBlock = useMemo(() => {
        if (!error) {
            return null;
        }

        return (
            <div className={block('details')}>
                <ErrorDetails
                    error={error}
                    settings={settings}
                    maxCollapsedDepth={maxCollapsedDepth}
                />
            </div>
        );
    }, [error, settings, maxCollapsedDepth]);

    const footerBlock = useMemo(() => {
        if (!footer) {
            return null;
        }

        return <div className={block('footer')}>{footer}</div>;
    }, [footer]);

    return (
        <div className={block()}>
            <div className={block('content')}>
                {iconBlock}
                <div className={block('body')}>
                    <div className={block('title')}>{title}</div>
                    {errorDetailsBlock}
                    {footerBlock}
                </div>
            </div>
        </div>
    );
};
