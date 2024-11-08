import React, {FC, PropsWithChildren} from 'react';
import {
    unstable_BreadcrumbsProps as BreadcrumbsProps,
    unstable_Breadcrumbs as UBreadcrumbs,
} from '@gravity-ui/uikit/unstable';
import './Breadcrumbs.scss';
import cn from 'bem-cn-lite';

const b = cn('yt-u-breadcrumbs');

export const Breadcrumbs: FC<PropsWithChildren<BreadcrumbsProps>> = ({children, ...props}) => {
    return (
        <UBreadcrumbs {...props} className={b(null, props.className)}>
            {children}
        </UBreadcrumbs>
    );
};
