import {ypath} from '../../../utils/ypath';

/** Doc key for erasure help URL in config.docsUrls */
export const ERASURE_DOCS_KEY = 'storage:replication#erasure';

export default (attributes, options = {}) => {
    const {docsUrls} = options;
    const [erasureCodec, replicationFactor] = ypath.getValues(attributes, [
        '/erasure_codec',
        '/replication_factor',
    ]);

    const hideReplicationFactor = erasureCodec && erasureCodec !== 'none';
    return [
        {
            key: 'erasure codec',
            value: erasureCodec,
            helpUrl: docsUrls?.[ERASURE_DOCS_KEY],
            visible: erasureCodec !== 'none',
        },
        {
            key: 'replication factor',
            value: replicationFactor,
            visible: !hideReplicationFactor && replicationFactor !== 'none',
        },
    ];
};
