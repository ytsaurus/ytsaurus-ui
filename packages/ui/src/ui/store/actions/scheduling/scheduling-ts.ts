import _ from 'lodash';
import {
    INTEGRAL_GUARANTEES_PREFIX,
    InitialPoolResourceInfo,
    POOL_RESOURCE_TYPE_TO_ATTRIBUTE,
    PoolResourceType,
} from '../../../utils/scheduling/scheduling';
import {getBatchError} from '../../../utils/utils';
import {updateNodeAttributes} from '../../../utils/cypress-attributes';
import {YTApiId, ytApiV4Id} from '../../../rum/rum-wrap-api';

type PoolResources = Partial<
    Record<Exclude<PoolResourceType, 'guaranteeType'>, InitialPoolResourceInfo>
>;

interface SetResourceGuaranteeParams {
    poolPath: string;
    values: PoolResources & {guaranteeType: string};
    initials: PoolResources;
    tree: string;
}

export function setPoolAttributes(params: SetResourceGuaranteeParams) {
    const {poolPath, values, initials, tree} = params;
    if (_.isEmpty(values)) {
        return Promise.resolve();
    }

    const transferData: Array<{diff: number; source: string; path: string}> = [];
    const toModify: Array<{attr: string; value: any}> = [];

    const {guaranteeType, ...restValues} = values;

    _.forEach(restValues, (v, k) => {
        const {limit, source} = v || {};
        const key = k as keyof typeof restValues;

        const attr = POOL_RESOURCE_TYPE_TO_ATTRIBUTE[key];
        if (!source || limit === undefined) {
            toModify.push({attr, value: limit});
        } else {
            const prevLimit = initials[key]?.limit || 0;
            const diff = (limit || 0) - prevLimit;
            if (diff) {
                transferData.push({diff, source, path: attr});
            }
        }
    });

    if (Object.hasOwnProperty.call(values, 'guaranteeType')) {
        toModify.push({
            attr: POOL_RESOURCE_TYPE_TO_ATTRIBUTE['guaranteeType'],
            value: guaranteeType,
        });
    }

    return updateNodeAttributes(poolPath, toModify).then(() => {
        return transferPoolQuota({poolPath, transferData, tree});
    });
}

interface TransferPoolQuotaParams {
    poolPath: string;
    transferData: Array<{diff: number; source: string; path: string}>;
    tree: string;
}

function transferPoolQuota({poolPath, transferData, tree}: TransferPoolQuotaParams) {
    if (_.isEmpty(transferData)) {
        return Promise.resolve();
    }
    const tmp = poolPath.split('/');
    const dstPool = tmp[tmp.length - 1];

    const requests = _.map(transferData, (v) => {
        const {diff, source, path} = v;
        const transferPath = path.startsWith(INTEGRAL_GUARANTEES_PREFIX)
            ? path.substr(INTEGRAL_GUARANTEES_PREFIX.length)
            : path;
        const dotPath = transferPath.replace(/\//g, '.');

        const delta = _.update({}, dotPath, () => Math.abs(diff));

        return {
            command: 'transfer_pool_resources' as const,
            parameters: {
                source_pool: diff > 0 ? source : dstPool,
                destination_pool: diff > 0 ? dstPool : source,
                pool_tree: tree,
                resource_delta: delta,
            },
        };
    });

    return ytApiV4Id
        .executeBatch(YTApiId.schedulingTransferPoolQuota, {requests})
        .then((res: any) => {
            const err = getBatchError(res.results);
            if (err) {
                return Promise.reject(err);
            }
            return res;
        });
}
