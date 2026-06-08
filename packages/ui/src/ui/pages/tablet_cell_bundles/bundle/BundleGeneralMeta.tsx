import React from 'react';
import cn from 'bem-cn-lite';
import {selectTabletsActiveBundleData} from '../../../store/selectors/tablet_cell_bundles';
import {useSelector} from '../../../store/redux-hooks';
import {MetaTable, type MetaTableItem} from '@ytsaurus/components';
import {Progress} from '@gravity-ui/uikit';

// @ts-ignore
import hammer from '@ytsaurus/interface-helpers/lib/hammer';
import ypath from '../../../common/thor/ypath';

import AccountLink from '../../accounts/AccountLink';
import {Health} from '../../../components/Health/Health';
import {calcProgressProps} from '../../../utils/utils';
import {
    selectCluster,
    selectClusterUiConfig,
    selectClusterUiConfigEnablePerBundleTabletAccounting,
} from '../../../store/selectors/global';

import './BundleGeneralMeta.scss';
import UIFactory from '../../../UIFactory';
import i18n from './i18n';

const block = cn('bundle-general-meta');

export function BundleBalancerValue(props: {value?: boolean; blocking?: boolean}) {
    const {value = true, blocking} = props;
    return (
        <span className={block('bb', {success: value, blocking})}>
            {value ? i18n('value_on') : i18n('value_off')}
        </span>
    );
}

export default function BundleGeneralMeta() {
    const bundleData = useSelector(selectTabletsActiveBundleData);
    const clusterUiConfig = useSelector(selectClusterUiConfig);
    const cluster = useSelector(selectCluster);
    const allowTabletAccounting = useSelector(selectClusterUiConfigEnablePerBundleTabletAccounting);

    if (!bundleData) {
        return null;
    }

    const leftGroup: Array<MetaTableItem> = [
        ...(UIFactory.getExtraMetaTableItemsForBundle({bundle: bundleData, clusterUiConfig}) || []),
        {
            key: i18n('field_health'),
            value: <Health value={bundleData.health} />,
        },
        {
            key: i18n('field_tablet-cells'),
            value: hammer.format['Number'](bundleData.tabletCells),
        },
        {
            key: i18n('field_tablets'),
            value: hammer.format['Number'](bundleData.tablets),
            visible: !allowTabletAccounting,
        },
        {
            key: i18n('field_bundle-controller'),
            value: <BundleBalancerValue value={bundleData.enable_bundle_controller} />,
        },
        {
            key: i18n('field_node-tag-filter'),
            value: bundleData.node_tag_filter || hammer.format.NO_VALUE,
        },
    ];

    const rightGroup: Array<MetaTableItem> = [
        {
            key: i18n('field_memory'),
            value: hammer.format['Bytes'](bundleData.memory),
            visible: !allowTabletAccounting,
        },
        {
            key: i18n('field_tablets'),
            value: renderResourceProgress(bundleData, 'tablet_count'),
            visible: allowTabletAccounting,
        },
        {
            key: i18n('field_tablet-static-memory'),
            value: renderResourceProgress(bundleData, 'tablet_static_memory'),
            visible: allowTabletAccounting,
        },
        {
            key: i18n('field_uncompressed-size'),
            value: hammer.format['Bytes'](bundleData.uncompressed),
        },
        {
            key: i18n('field_compressed-size'),
            value: hammer.format['Bytes'](bundleData.compressed),
        },
        {
            key: i18n('field_changelog-account'),
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
            key: i18n('field_snapshot-account'),
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

    return (
        <MetaTable
            className={block()}
            items={[leftGroup, rightGroup]}
            title={i18n('title_general')}
        />
    );
}

function renderResourceProgress(data: object, resourceName: string) {
    const usage = ypath.getValue(data, `/resource_usage/${resourceName}`);
    const limit = ypath.getValue(data, `/resource_limits/${resourceName}`);

    const format = resourceName === 'tablet_static_memory' ? 'Bytes' : 'Number';
    const props = calcProgressProps(usage, limit, format);

    return <Progress className={block('progress')} {...props} />;
}
