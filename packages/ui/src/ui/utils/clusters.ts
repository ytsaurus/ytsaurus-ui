import _ from 'lodash';
import {rumLogError} from '../rum/rum-counter';
import YT from '../config/yt-config';

const {clusters} = YT;

export function findClusterConfigByOperationId(operationId: string) {
    try {
        const cellTag = Number.parseInt(operationId?.split('-')[2], 16) >> 16; // eslint-disable-line no-bitwise
        return _.find(
            clusters,
            (clusterConfig) => clusterConfig.primaryMaster?.cellTag === cellTag,
        );
    } catch (error) {
        rumLogError(
            {
                message: 'Cannot find cluster config for operation',
                additional: {
                    operationId,
                },
            },
            error as any,
        );
    }
    return null;
}
