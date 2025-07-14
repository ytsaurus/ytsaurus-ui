import map_ from 'lodash/map';

import React from 'react';

// @ts-expect-error
import ypath from '@ytsaurus/interface-helpers/lib/ypath';

import format from '../../../common/hammer/format';
import {Template} from '../../../components/MetaTable/templates/Template';

import i18n from './i18n';

export default function metaTablePresetSize(attributes: unknown, mediumList: Array<string>) {
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
            tooltip: i18n('medium_disk_space:tooltip', {
                name: format.ReadableField(medium),
                medium,
            }),
        };
    });

    const showMediums = mediumsTemplates.filter((medium) => medium.visible).length > 1;

    return [
        {
            key: 'uncompressed_data_size',
            value: <Template.FormattedValue value={uncompressedDataSize} format="Bytes" />,
            visible: Boolean(uncompressedDataSize),
            tooltip: i18n('uncompressed_size:tooltip'),
        },
        {
            key: 'compressed_data_size',
            value: <Template.FormattedValue value={compressedDataSize} format="Bytes" />,
            visible: Boolean(compressedDataSize),
            tooltip: i18n('compressed_size:tooltip'),
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
            tooltip: i18n('disk_space:tooltip'),
        },
        ...(showMediums ? mediumsTemplates : []),
    ];
}
