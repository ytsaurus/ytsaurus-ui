import map_ from 'lodash/map';

import {ypath} from '../../../utils/ypath';
import format from '../../../utils/hammer/format';
import {Template} from '../templates/Template';

import i18n from './i18n';

export function metaTablePresetSize(attributes: unknown, mediumList: Array<string>) {
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
            visible: usageMediumDiskSpace !== undefined || mediumDiskSpace !== undefined,
            tooltip: i18n('context_medium-disk-space', {
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
            visible: uncompressedDataSize !== undefined,
            tooltip: i18n('context_uncompressed-size'),
        },
        {
            key: 'compressed_data_size',
            value: <Template.FormattedValue value={compressedDataSize} format="Bytes" />,
            visible: compressedDataSize !== undefined,
            tooltip: i18n('context_compressed-size'),
        },
        {
            key: 'primary_medium',
            value: <Template.Readable value={primaryMedium} />,
            visible: primaryMedium !== undefined,
        },
        {
            key: 'disk_space',
            label: 'Total disk space',
            value: <Template.FormattedValue value={usageDiskSpace ?? diskSpace} format="Bytes" />,
            visible: usageDiskSpace !== undefined || diskSpace !== undefined,
            tooltip: i18n('context_disk-space'),
        },
        ...(showMediums ? mediumsTemplates : []),
    ];
}
