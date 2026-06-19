import {format, ypath} from '../../../utils';
import i18n from './i18n';

export const compression = (attributes) => {
    const [compressionRatio, compressionCodec] = ypath.getValues(attributes, [
        '/compression_ratio',
        '/compression_codec',
    ]);

    return [
        {
            key: 'compression_ratio',
            label: i18n('field_compression-ratio'),
            value: format['Number'](compressionRatio, {digits: 5}),
        },
        {
            key: 'compression_codec',
            label: i18n('field_compression-codec'),
            value: compressionCodec,
        },
    ];
};
