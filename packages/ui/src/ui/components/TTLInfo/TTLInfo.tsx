import React from 'react';

import {MetaTable, TTLLabel, Tooltip, makeTTLItems} from '@ytsaurus/components';

import {YT} from '../../config/yt-config';
import UIFactory from '../../UIFactory';
import {makeNavigationLink} from '../../utils/app-url';

export default function TTLInfo({
    attributes,
    size,
    className,
}: {
    attributes: unknown;
    size: React.ComponentProps<typeof TTLLabel>['size'];
    className?: string;
}) {
    const ttlItems = makeTTLItems(attributes, {
        docsUrls: UIFactory.docsUrls,
        cluster: YT.cluster,
        config: {
            navigationLinkTemplate: makeNavigationLink,
        },
    });

    if (!ttlItems.length) {
        return null;
    }

    return (
        <Tooltip className={className} content={<MetaTable items={ttlItems} />}>
            <TTLLabel size={size} />
        </Tooltip>
    );
}
