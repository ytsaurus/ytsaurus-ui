import ypath from '@ytsaurus/interface-helpers/lib/ypath';
import hammer from '../../../common/hammer';
import _ from 'lodash';

import {Page} from '../../../constants';
import {TabletsTab} from '../../../constants/tablets';
import {nanToUndefined} from '../../utils';

export function prepareTabletCells(tabletCells) {
    return _.map(tabletCells, (tabletCell) => {
        const uncompressed = ypath.getValue(
            tabletCell,
            '/@total_statistics/uncompressed_data_size',
        );
        const compressed = ypath.getValue(tabletCell, '/@total_statistics/compressed_data_size');
        const tablets = ypath.getValue(tabletCell, '/@total_statistics/tablet_count');
        const memory = ypath.getValue(tabletCell, '/@total_statistics/memory_size');
        const health = ypath.getValue(tabletCell, '/@status/health');

        const bundle = ypath.getValue(tabletCell, '/@tablet_cell_bundle');
        const peers = ypath.getValue(tabletCell, '/@peers');
        const id = ypath.getValue(tabletCell, '/@id');

        const peerCount = peers ? peers.length : 0;

        let peer;
        let peerAddress;
        let state;

        if (peerCount) {
            peer = _.find(peers, (peer) => peer.state === 'leading') || peers[0];
            peerAddress = peer.address;
            state = peer.state;
        }

        return {
            id,
            health,
            state,
            bundle,
            tablets,
            memory,
            uncompressed,
            compressed,
            peers,
            peer,
            peerAddress,
        };
    });
}

export function aggregateTotal(data) {
    const initialTotal = {
        bundle: 'total',
        tablets: 0,
        nodes: [],
        memory: 0,
        uncompressed: 0,
        compressed: 0,
        tabletCells: 0,
        isTotal: true,
    };

    const total = hammer.aggregation.prepare(data, [
        {name: 'tablets', type: 'sum'},
        {name: 'nodes', type: 'concat-array'},
        {name: 'memory', type: 'sum'},
        {name: 'uncompressed', type: 'sum'},
        {name: 'compressed', type: 'sum'},
        {name: 'tabletCells', type: 'sum'},
    ]);

    return data.length ? total[0] : initialTotal;
}

function collectBundlesAttrs(dst, attrs) {
    const resource_limits = ypath.getValue(attrs, '/resource_limits');
    const resource_usage = ypath.getValue(attrs, '/resource_usage');

    const tc_usage = ypath.getValue(resource_usage, '/tablet_count');
    const tc_limit = ypath.getValue(resource_limits, '/tablet_count');

    const tsm_usage = ypath.getValue(resource_usage, '/tablet_static_memory');
    const tsm_limit = ypath.getValue(resource_limits, '/tablet_static_memory');

    return {
        ...dst,
        bundle_controller_target_config: ypath.getValue(attrs, '/bundle_controller_target_config'),
        enable_bundle_controller: ypath.getValue(attrs, '/enable_bundle_controller') || false,
        enable_bundle_balancer: ypath.getValue(attrs, '/enable_bundle_balancer'),
        changelog_account: ypath.getValue(attrs, '/options/changelog_account'),
        snapshot_account: ypath.getValue(attrs, '/options/snapshot_account'),
        node_tag_filter: ypath.getValue(attrs, '/node_tag_filter'),
        health: ypath.getValue(attrs, '/health'),
        zone: ypath.getValue(attrs, '/zone'),
        resource_limits,
        resource_usage,

        tablet_count: tc_usage,
        tablet_count_limit: tc_limit,
        tablet_count_free: tc_limit - tc_usage,
        tablet_count_percentage: nanToUndefined((100 * tc_usage) / tc_limit),

        tablet_static_memory: tsm_usage,
        tablet_static_memory_limit: tsm_limit,
        tablet_static_memory_free: tsm_limit - tsm_usage,
        tablet_static_memory_percentage: nanToUndefined((100 * tsm_usage) / tsm_limit),
    };
}

export function prepareBundles(tabletCells, bundles) {
    let aggregation = hammer.aggregation.prepare(
        tabletCells,
        [
            {name: 'tablets', type: 'sum'},
            {name: 'memory', type: 'sum'},
            {name: 'uncompressed', type: 'sum'},
            {name: 'compressed', type: 'sum'},
            {name: 'tabletCells', type: 'count'},
        ],
        'bundle',
    );

    aggregation.splice(0, 1);

    aggregation = _.reduce(
        aggregation,
        (res, bundle) => {
            const $attributes = bundles[bundle.bundle].$attributes;
            const bundleNodes = ypath.getValue($attributes, '/nodes');
            res[bundle.bundle] = {
                $attributes,
                ...collectBundlesAttrs({}, $attributes),
                ...bundle,
                nodes: bundleNodes,
            };
            return res;
        },
        {},
    );

    const bundleList = _.reduce(
        bundles,
        (res, value, key) => {
            if (aggregation[key]) {
                res.push(aggregation[key]);
            } else {
                res.push({
                    ...collectBundlesAttrs({}, value.$attributes),
                    bundle: key,
                    nodes: value.$attributes.nodes,
                    tabletCells: 0,
                });
            }
            return res;
        },
        [],
    );

    const nodeTags = _.reduce(
        bundleList,
        (res, bundle) => {
            const tag = bundle?.node_tag_filter;
            if (tag) {
                res[tag] = res[tag] ? res[tag] + 1 : 1;
            }
            return res;
        },
        {},
    );

    return bundleList.map((bundle) => ({
        ...bundle,
        unique_node_tag: bundle?.node_tag_filter ? nodeTags[bundle.node_tag_filter] === 1 : true,
    }));
}

export function tabletCellNavigationLink(cluster, cellId) {
    return `/${cluster}/navigation?path=//sys/tablet_cells/${cellId}`;
}

export function tabletActiveBundleLink(cluster, bundle, enable_bundle_controller) {
    const tabletTab = enable_bundle_controller ? TabletsTab.INSTANCES : TabletsTab.TABLET_CELLS;
    return `/${cluster}/${Page.TABLET_CELL_BUNDLES}/${tabletTab}?activeBundle=${bundle}`;
}

export function tabletActiveChaosBundleLink(cluster, bundle) {
    return `/${cluster}/${Page.TABLET_CELL_BUNDLES}/${TabletsTab.TABLET_CELLS}?activeBundle=${bundle}`;
}

export function tabletCellBundleRootLink(cluster) {
    return `/${cluster}/${Page.TABLET_CELL_BUNDLES}`;
}

export function tabletChaosBundleRootLink(cluster) {
    return `/${cluster}/${Page.CHAOS_CELL_BUNDLES}`;
}

export function tabletCellBundlesLink(cluster) {
    return `/${cluster}/${Page.TABLET_CELL_BUNDLES}`;
}

export function tabletAttributesPath(id) {
    return `//sys/tablet_cells/${id}`;
}

export function chaosCellNavigationLink(cluster, cellId) {
    return `/${cluster}/navigation?path=//sys/chaos_cells/${cellId}`;
}

export function chaosActiveBundleLink(cluster, bundle) {
    return `/${cluster}/${Page.CHAOS_CELL_BUNDLES}/${TabletsTab.CHAOS_CELLS}?activeBundle=${bundle}`;
}

export function chaosCellBundlesLink(cluster) {
    return `/${cluster}/${Page.CHAOS_CELL_BUNDLES}`;
}

export function chaosAttributesPath(id) {
    return `//sys/chaos_cells/${id}`;
}
