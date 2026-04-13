import {ypath} from '../../../utils';
const ERASURE_DOCS_KEY = 'storage:replication#erasure';

export const erasureReplication = (attributes, options = {}) => {
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
