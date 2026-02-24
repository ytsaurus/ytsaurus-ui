import {format, ypath} from '../../../utils';

export const compression = (attributes) => {
    const [compressionRatio, compressionCodec] = ypath.getValues(attributes, [
        '/compression_ratio',
        '/compression_codec',
    ]);

    return [
        {
            key: 'compression_ratio',
            value: format['Number'](compressionRatio, {digits: 5}),
        },
        {
            key: 'compression_codec',
            value: compressionCodec,
        },
    ];
};
