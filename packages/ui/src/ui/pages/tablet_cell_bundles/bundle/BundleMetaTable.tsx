import React from 'react';
import cn from 'bem-cn-lite';

import BundleGeneralMeta from './BundleGeneralMeta';
import BundleConfigurationMeta, {
    ActiveAccountBundleControllerUpdater,
} from './BundleConfigurationMeta';

import './BundleMetaTable.scss';

const block = cn('bundle-meta-table');

export default function BundleMetaTable() {
    return (
        <div className={block('container')}>
            <BundleGeneralMeta />
            <BundleConfigurationMeta />
            <ActiveAccountBundleControllerUpdater />
        </div>
    );
}
