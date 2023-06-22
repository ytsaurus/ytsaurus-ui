import React from 'react';

import MetaTable from '../../components/MetaTable/MetaTable';
import {TTLLabel, makeTTLItems} from '../../components/MetaTable/presets/ttl';
import {Tooltip, TooltipProps} from '../../components/Tooltip/Tooltip';

export default function TTLInfo({
    attributes,
    onClick,
    size,
    className,
}: {
    attributes: unknown;
    onClick: TooltipProps['onClick'];
    size: React.ComponentProps<typeof TTLLabel>['size'];
    className?: string;
}) {
    const ttlItems = makeTTLItems(attributes);

    if (!ttlItems.length) {
        return null;
    }

    return (
        <Tooltip
            className={className}
            content={<MetaTable items={ttlItems} />}
            forceLinksAppearance={false}
            onClick={onClick}
        >
            <TTLLabel size={size} />
        </Tooltip>
    );
}
