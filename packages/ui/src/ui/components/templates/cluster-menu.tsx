import React from 'react';
import {Link as LinkImpl, type LinkProps} from '@gravity-ui/uikit';

import StatusBulb from '../../components/StatusBulb/StatusBulb';
import hammer from '../../common/hammer';
import templates from './utils';
import {getClusterAppearance} from '../../appearance';

// Keep the ignored legacy prop and the same UIKit component at runtime.
const Link: React.ComponentType<LinkProps & {theme?: string}> = LinkImpl;

type ClusterMenuItem = {
    id: string;
    name: string;
    theme?: string;
    environment?: string;
    access: 'none' | 'granted';
    status: 'available' | 'unavailable';
    version?: string;
};

templates.add<ClusterMenuItem>('cluster-menu', {
    image(item) {
        const {theme} = item;
        const itemStyle = {
            backgroundImage: 'url(' + getClusterAppearance(item.id).icon + ')',
        };
        const clusterTheme = theme ? `cluster-color_theme_${theme}` : 'cluster-color';
        return (
            <div
                className={`cluster-menu__table-item-image ${clusterTheme}`}
                style={itemStyle}
            ></div>
        );
    },
    environment(item) {
        return (
            <span className="elements-heading elements-heading_theme_system">
                {hammer.format['ValueOrDefault'](item.environment)}
            </span>
        );
    },
    name(item) {
        return (
            <Link theme="primary" href={'/' + item.id + '/'} target="_blank">
                {item.name}
            </Link>
        );
    },
    access(item) {
        const theme = (
            {
                none: 'disabled',
                granted: 'enabled',
            } as const
        )[item.access];

        return <StatusBulb theme={theme} />;
    },
    status(item) {
        const theme = (
            {
                available: 'enabled',
                unavailable: 'disabled',
            } as const
        )[item.status];

        return <StatusBulb theme={theme} />;
    },
    version(item) {
        return hammer.format['ValueOrDefault'](item.version);
    },
});
