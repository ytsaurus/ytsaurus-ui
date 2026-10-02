import React from 'react';
import cn from 'bem-cn-lite';

import {Flex} from '@gravity-ui/uikit';

import BundleGeneralMeta from './BundleGeneralMeta';
import BundleConfigurationMeta, {
    ActiveAccountBundleControllerUpdater,
} from './BundleConfigurationMeta';
import UIFactory from '../../../UIFactory';

import './BundleMetaTable.scss';

const block = cn('bundle-meta-table');

type Props = {
    cluster: string;
    bundle?: string;
};

export default function BundleMetaTable({cluster, bundle}: Props) {
    return (
        <Flex className={block('container')} wrap alignItems="flex-start">
            <BundleGeneralMeta />
            <Flex alignItems="flex-start" gap={5}>
                <BundleConfigurationMeta />
                {UIFactory.renderBundleMetaTableExtraContent({cluster, bundle})}
            </Flex>
            <ActiveAccountBundleControllerUpdater />
        </Flex>
    );
}
