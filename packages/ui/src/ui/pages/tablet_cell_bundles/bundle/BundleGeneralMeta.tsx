import {Progress} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import React from 'react';
import {useSelector} from 'react-redux';
import MetaTable, {MetaTableItem} from '../../../components/MetaTable/MetaTable';
import {getTabletsActiveBundleData} from '../../../store/selectors/tablet_cell_bundles';

// @ts-ignore
import hammer from '@ytsaurus/interface-helpers/lib/hammer';
import ypath from '../../../common/thor/ypath';

import Label, {LabelTheme} from '../../../components/Label/Label';
import {
    getCluster,
    getClusterUiConfig,
    getClusterUiConfigEnablePerBundleTabletAccounting,
} from '../../../store/selectors/global';
import {YTHealth} from '../../../types';
import {calcProgressProps} from '../../../utils/utils';
import AccountLink from '../../accounts/AccountLink';

import UIFactory from '../../../UIFactory';
import './BundleGeneralMeta.scss';

const block = cn('bundle-general-meta');

export function BundleBalancerValue(props: {value?: boolean; blocking?: boolean}) {
    const {value = true, blocking} = props;
    return <span className={block('bb', {success: value, blocking})}>{value ? 'on' : 'off'}</span>;
}

const HEALTH_TO_THEME: {[health: string]: LabelTheme} = {
    good: 'success',
    initializing: 'warning',
    degrading: 'warning',
    failed: 'danger',
    changing: 'info',
};

export function Health(props: {value?: YTHealth; className?: string}) {
    const {value, className} = props;
    const theme: LabelTheme = HEALTH_TO_THEME[value || ''];
    return !value ? (
        hammer.format.NO_VALUE
    ) : (
        <Label className={className} theme={theme}>
            {value}
        </Label>
    );
}

export default function BundleGeneralMeta() {
    const bundleData = useSelector(getTabletsActiveBundleData);
    const clusterUiConfig = useSelector(getClusterUiConfig);
    const cluster = useSelector(getCluster);
    const allowTabletAccounting = useSelector(getClusterUiConfigEnablePerBundleTabletAccounting);
    console.log(bundleData);

    if (!bundleData) {
        return null;
    }

    const leftGroup: Array<MetaTableItem> = [
        ...(UIFactory.getExtraMetaTableItemsForBundle({bundle: bundleData, clusterUiConfig}) || []),
        {
            key: 'Health',
            value: <Health value={bundleData.health} />,
        },
        {
            key: 'Tablet cells',
            value: hammer.format['Number'](bundleData.tabletCells),
        },
        {
            key: 'Tablets',
            value: hammer.format['Number'](bundleData.tablets),
            visible: !allowTabletAccounting,
        },
        {
            key: 'Bundle controller',
            value: <BundleBalancerValue value={bundleData.enable_bundle_controller} />,
        },
        {
            key: 'Bundle balancer',
            value: (
                <BundleBalancerValue
                    value={bundleData.enable_bundle_balancer}
                    blocking={bundleData.enable_bundle_controller}
                />
            ),
        },
        {
            key: 'Node tag filter',
            value: bundleData.node_tag_filter || hammer.format.NO_VALUE,
        },
    ];

    const rightGroup: Array<MetaTableItem> = [
        {
            key: 'Memory',
            value: hammer.format['Bytes'](bundleData.memory),
            visible: !allowTabletAccounting,
        },
        {
            key: 'Tablets',
            value: renderResourceProgress(bundleData, 'tablet_count'),
            visible: allowTabletAccounting,
        },
        {
            key: 'Tablet static memory',
            value: renderResourceProgress(bundleData, 'tablet_static_memory'),
            visible: allowTabletAccounting,
        },
        {
            key: 'Uncompressed size',
            value: hammer.format['Bytes'](bundleData.uncompressed),
        },
        {
            key: 'Compressed size',
            value: hammer.format['Bytes'](bundleData.compressed),
        },
        {
            key: 'Changelog account',
            value: bundleData.changelog_account ? (
                <AccountLink
                    className={block('account-link')}
                    account={bundleData.changelog_account}
                    cluster={cluster}
                />
            ) : (
                hammer.format.NO_VALUE
            ),
        },
        {
            key: 'Snapshot account',
            value: bundleData.snapshot_account ? (
                <AccountLink
                    className={block('account-link')}
                    account={bundleData.snapshot_account}
                    cluster={cluster}
                />
            ) : (
                hammer.format.NO_VALUE
            ),
        },
    ];

    return <MetaTable className={block()} items={[leftGroup, rightGroup]} title={'General'} />;
}

function renderResourceProgress(data: object, resourceName: string) {
    const usage = ypath.getValue(data, `/resource_usage/${resourceName}`);
    const limit = ypath.getValue(data, `/resource_limits/${resourceName}`);

    const format = resourceName === 'tablet_static_memory' ? 'Bytes' : 'Number';
    const props = calcProgressProps(usage, limit, format);

    return <Progress className={block('progress')} {...props} />;
}
