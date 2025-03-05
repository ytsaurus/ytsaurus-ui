import map_ from 'lodash/map';

import React from 'react';
import ypath from '@ytsaurus/interface-helpers/lib/ypath';
import {Template} from '../../../components/MetaTable/templates/Template';

export default function metaTablePresetSize(attributes, mediumList) {
    const [uncompressedDataSize, compressedDataSize, primaryMedium] = ypath.getValues(attributes, [
        '/uncompressed_data_size',
        '/compressed_data_size',
        '/primary_medium',
    ]);
    const [usageDiskSpace, diskSpace] = ypath.getValues(attributes, [
        '/resource_usage/disk_space',
        '/disk_space',
    ]);

    const mediumsTemplates = map_(mediumList, (medium) => {
        const usageMediumDiskSpace = ypath.getValue(
            attributes,
            `/resource_usage/disk_space_per_medium/${medium}`,
        );
        const mediumDiskSpace = ypath.getValue(attributes, `/disk_space_per_medium/${medium}`);

        return {
            key: medium + '_disk_space',
            value: (
                <Template.FormattedValue
                    value={usageMediumDiskSpace || mediumDiskSpace}
                    format="Bytes"
                />
            ),
            visible: Boolean(usageMediumDiskSpace || mediumDiskSpace),
        };
    });

    const showMediums = mediumsTemplates.filter((medium) => medium.visible).length > 1;

    return [
        {
            key: 'uncompressed_data_size',
            value: <Template.FormattedValue value={uncompressedDataSize} format="Bytes" />,
            visible: Boolean(uncompressedDataSize),
        },
        {
            key: 'compressed_data_size',
            value: <Template.FormattedValue value={compressedDataSize} format="Bytes" />,
            visible: Boolean(compressedDataSize),
        },
        {
            key: 'primary_medium',
            value: <Template.Readable value={primaryMedium} />,
            visible: Boolean(primaryMedium),
        },
        {
            key: 'disk_space',
            label: 'Total disk space',
            value: <Template.FormattedValue value={usageDiskSpace || diskSpace} format="Bytes" />,
            visible: Boolean(usageDiskSpace || diskSpace),
        },
        ...(showMediums ? mediumsTemplates : []),
    ];
}
