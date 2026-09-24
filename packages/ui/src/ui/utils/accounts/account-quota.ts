import update_ from 'lodash/update';

// @ts-ignore
import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import {RESOURCES_LIMITS_PREFIX} from '../../constants/accounts';
import {setAccountLimit} from './editor';

export interface AccountQuotaParams {
    limit: number;
    limitDiff: number;
    account: string;
    resourcePath: string;
    distributeAccount?: string;
}

export function setAccountQuotaImpl(params: AccountQuotaParams): Promise<void> {
    const {limit, limitDiff, account, resourcePath, distributeAccount} = params;
    const dotPath = resourcePath.replace(/\//g, '.');

    if (!limitDiff) {
        return Promise.resolve();
    }
    if (!distributeAccount) {
        return setAccountLimit(limit, account, RESOURCES_LIMITS_PREFIX + resourcePath);
    }
    if (limitDiff > 0) {
        return yt.v4.transferAccountResources({
            parameters: {
                source_account: distributeAccount,
                destination_account: account,
                resource_delta: update_({}, dotPath, () => limitDiff),
            },
        });
    }

    return yt.v4.transferAccountResources({
        parameters: {
            source_account: account,
            destination_account: distributeAccount,
            resource_delta: update_({}, dotPath, () => -limitDiff),
        },
    });
}
