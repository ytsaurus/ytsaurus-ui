import ypath from '@ytsaurus/interface-helpers/lib/ypath';
import hammer from '@ytsaurus/interface-helpers/lib/hammer';

export default (attributes) => {
    const [compressionRatio, compressionCodec] = ypath.getValues(attributes, [
        '/compression_ratio',
        '/compression_codec',
    ]);

    return [
        {
            key: 'compression_ratio',
            value: hammer.format['Number'](compressionRatio, {digits: 5}),
        },
        {
            key: 'compression_codec',
            value: compressionCodec,
        },
    ];
};
