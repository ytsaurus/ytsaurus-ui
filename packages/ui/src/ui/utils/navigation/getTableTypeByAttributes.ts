import ypath from '../../common/thor/ypath';

export const getTableTypeByAttributes = (isDynamic: boolean, attributes: any) => {
    if (isDynamic) {
        const [upstreamReplicaID, type] = ypath.getValues(attributes, [
            '/upstream_replica_id',
            '/type',
        ]);
        if (String(type).startsWith('chaos')) {
            return 'chaos';
        }
        if (upstreamReplicaID && upstreamReplicaID !== '0-0-0-0') {
            return 'replica';
        }
        return 'dynamic';
    } else {
        return 'static';
    }
};
