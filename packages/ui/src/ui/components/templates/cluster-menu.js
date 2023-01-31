import React from 'react';

import StatusBulb from '../../components/StatusBulb/StatusBulb';
import hammer from '../../common/hammer';
import templates from './utils.js';
import Link from '../../components/Link/Link';
import {getClusterAppearance} from '../../appearance';

templates.add('cluster-menu', {
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
            <Link theme="primary" url={'/' + item.id + '/'}>
                {item.name}
            </Link>
        );
    },
    access(item) {
        const theme = {
            none: 'disabled',
            granted: 'enabled',
        }[item.access];

        return <StatusBulb theme={theme} />;
    },
    status(item) {
        const theme = {
            available: 'enabled',
            unavailable: 'disabled',
        }[item.status];

        return <StatusBulb theme={theme} />;
    },
    version(item) {
        return hammer.format['ValueOrDefault'](item.version);
    },
});
