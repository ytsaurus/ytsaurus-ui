import './components/nodes/nodes';
import './components/nodes/node';

import React from 'react';
import block from 'bem-cn-lite';
import _ from 'lodash';
import {Progress} from '@gravity-ui/uikit';

import Link from '../../components/Link/Link';
import templates from '../../components/templates/utils.js';

import hammer from '../../common/hammer';
import {genTabletCellBundlesCellUrl} from '../../utils/tablet_cell_bundles';

function renderUsage(used, limit, format) {
    const left = hammer.format[format](used);
    const right = hammer.format[format](limit);

    return (
        <span>
            {left}&nbsp;/&nbsp;{right}
        </span>
    );
}

const b = block('elements-label');

const TABLET_SLOTS = {
    none: {
        theme: 'default',
        text: 'N',
    },
    stopped: {
        theme: 'default',
        text: 'S',
    },
    elections: {
        theme: 'warning',
        text: 'E',
    },
    follower_recovery: {
        theme: 'warning',
        text: 'FR',
    },
    leader_recovery: {
        theme: 'warning',
        text: 'LR',
    },
    following: {
        theme: 'primary',
        text: 'F',
    },
    leading: {
        theme: 'success',
        text: 'L',
    },
};

const IO_WEIGHT_PREFIX = 'io_weight_';

templates.add('components/nodes', {
    __default__(item, columnName) {
        if (typeof item.IOWeight === 'object' && columnName.indexOf(IO_WEIGHT_PREFIX) === 0) {
            const mediumName = columnName.slice(IO_WEIGHT_PREFIX.length);

            return hammer.format['Number'](item.IOWeight[mediumName]);
        }
    },

    host: templates.get('components').host,

    state: templates.get('components').state,

    rack(item) {
        return <span className="elements-monospace">{hammer.format['Address'](item.rack)}</span>;
    },

    user_tags(item) {
        if (item.userTags) {
            return item.userTags.map((tag) => (
                <span key={tag} className={b({theme: 'default'})}>
                    {tag}
                </span>
            ));
        }

        return null;
    },

    banned: templates.get('components').banned,

    decommissioned(item) {
        return item.decommissioned ? <span className={b({theme: 'default'})}>D</span> : '—';
    },

    full(item) {
        return item.full ? <span className={b({theme: 'danger'})}>F</span> : '—';
    },

    alerts(item) {
        const alertsCount = item.alerts && item.alerts.length;

        return alertsCount ? <span className={b({theme: 'danger'})}>{alertsCount}</span> : '—';
    },

    space(item) {
        return <Progress value={item.spaceProgress} text={item.spaceText} theme="success" />;
    },

    space_limit(item) {
        return hammer.format['Bytes'](item.spaceUsed + item.spaceAvailable);
    },

    locations(item) {
        return item.locations
            ? renderUsage(item.enabledLocations.length, item.locations.length, 'Number')
            : null;
    },

    sessions(item) {
        return hammer.format['Number'](item.sessions);
    },

    chunks(item) {
        return hammer.format['Number'](item.chunks);
    },

    io_weight(item) {
        return hammer.format['Number'](item.IOWeight);
    },

    cpu(item) {
        return <Progress value={item.cpuProgress} text={item.cpuText} theme="success" />;
    },

    memory(item) {
        const {onMemoryProgressMouseEnter, onMemoryProgressMouseLeave} = this.props.templates.data;
        let onMouseEnterHandler;

        if (typeof onMemoryProgressMouseEnter === 'function') {
            onMouseEnterHandler = (event) =>
                onMemoryProgressMouseEnter(item, event.currentTarget, event);
        }

        return (
            <div onMouseEnter={onMouseEnterHandler} onMouseLeave={onMemoryProgressMouseLeave}>
                <Progress
                    value={item.memoryProgress}
                    text={item.memoryText}
                    stack={item.memoryData}
                />
            </div>
        );
    },

    memory_total(item) {
        return <Progress value={item.memoryProgress} text={item.memoryTotalText} theme="success" />;
    },

    network(item) {
        return <Progress value={item.networkProgress} text={item.networkText} theme="success" />;
    },

    repair_slots(item) {
        return renderUsage(item.repairSlots.usage, item.repairSlots.limits, 'Number');
    },

    removal_slots(item) {
        return renderUsage(item.removalSlots.usage, item.removalSlots.limits, 'Number');
    },

    replication_slots(item) {
        return renderUsage(item.replicationSlots.usage, item.replicationSlots.limits, 'Number');
    },

    seal_slots(item) {
        return renderUsage(item.sealSlots.usage, item.sealSlots.limits, 'Number');
    },

    user_slots(item) {
        return renderUsage(item.userSlots.usage, item.userSlots.limits, 'Number');
    },

    tablet_slots(item) {
        if (item.tabletSlots) {
            return _.map(_.keys(item.tabletSlots.byState), (state) => {
                const tabletSlots = item.tabletSlots.byState[state];
                const {text, theme} = TABLET_SLOTS[state];

                return (
                    <span key={state} className={b({theme})}>
                        {text}:&nbsp;{tabletSlots.length}
                    </span>
                );
            });
        }

        return null;
    },

    tablet_memory_static(item) {
        return renderUsage(item.tabletStaticMemory.used, item.tabletStaticMemory.limit, 'Bytes');
    },

    tablet_memory_dynamic(item) {
        return renderUsage(item.tabletDynamicMemory.used, item.tabletDynamicMemory.limit, 'Bytes');
    },
});

templates.add('components/proxies', {
    host: templates.get('components').host,

    state: templates.get('components').state,

    role(item) {
        const roleThemes = {
            control: 'default',
            data: 'default',
        };
        const labelClassName = b({
            theme: roleThemes[item.role] ? roleThemes[item.role] : 'warning',
        });

        return <span className={labelClassName}>{hammer.format['Address'](item.role)}</span>;
    },

    banned: templates.get('components').banned,

    load_average(item) {
        return <span>{hammer.format['Number'](item.loadAverage, {digits: 2})}</span>;
    },

    network_load(item) {
        return <span>{hammer.format['Number'](item.networkLoad, {digits: 2})}</span>;
    },

    updated_at(item) {
        return <span>{hammer.format['DateTime'](item.updatedAt, {format: 'short'})}</span>;
    },
});

templates.add('components/tablet-slots', {
    cell_id(tabletSlot) {
        if (typeof tabletSlot.cell_id === 'undefined') {
            return hammer.format.NO_VALUE;
        }

        const tabletCellHref = genTabletCellBundlesCellUrl(tabletSlot.cell_id);

        return (
            <Link title={tabletSlot.cell_id} url={tabletCellHref}>
                {tabletSlot.cell_id}
            </Link>
        );
    },

    peer_id(tabletSlot) {
        if (typeof tabletSlot.peer_id === 'undefined') {
            return hammer.format.NO_VALUE;
        }

        return tabletSlot.peer_id;
    },

    state(tabletSlot) {
        const {text, theme} = TABLET_SLOTS[tabletSlot.state];

        return (
            <span className={b({theme})} title={tabletSlot.state}>
                {text}
            </span>
        );
    },
});
