import React from 'react';

import MetaTable from '../../components/MetaTable/MetaTable';
import {TTLLabel, makeTTLItems} from '../../components/MetaTable/presets/ttl';
import {Tooltip} from '../../components/Tooltip/Tooltip';

export default function TTLInfo({
    attributes,
    size,
    className,
}: {
    attributes: unknown;
    size: React.ComponentProps<typeof TTLLabel>['size'];
    className?: string;
}) {
    const ttlItems = makeTTLItems(attributes);

    if (!ttlItems.length) {
        return null;
    }

    return (
        <Tooltip className={className} content={<MetaTable items={ttlItems} />}>
            <TTLLabel size={size} />
        </Tooltip>
    );
}
