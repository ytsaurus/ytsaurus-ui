import ypath from '@ytsaurus/interface-helpers/lib/ypath';
import {docsUrl} from '../../../config';
import UIFactory from '../../../UIFactory';

export default (attributes) => {
    const [erasureCodec, replicationFactor] = ypath.getValues(attributes, [
        '/erasure_codec',
        '/replication_factor',
    ]);

    const hideReplicationFactor = erasureCodec && erasureCodec !== 'none';
    return [
        {
            key: 'erasure codec',
            value: erasureCodec,
            helpUrl: docsUrl(UIFactory.docsUrls['storage:replication#erasure']),
            visible: erasureCodec !== 'none',
        },
        {
            key: 'replication factor',
            value: replicationFactor,
            visible: !hideReplicationFactor && replicationFactor !== 'none',
        },
    ];
};
