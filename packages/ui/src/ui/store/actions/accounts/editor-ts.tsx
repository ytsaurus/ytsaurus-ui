import _ from 'lodash';
import {RootState} from '../../../store/reducers';
import {setAccountLimit} from '../../../utils/accounts/editor';
import {ThunkAction} from 'redux-thunk';
import {FIX_MY_TYPE} from '../../../types';

// @ts-ignore
import yt from '@ytsaurus/javascript-wrapper/lib/yt';
import {RESOURCES_LIMITS_PREFIX} from '../../../constants/accounts';
import {accountsIncreaseEditCounter, loadEditedAccount} from './accounts';
import {wrapApiPromiseByToaster} from '../../../utils/utils';

export interface AccountQuotaParams {
    limit: number;
    limitDiff: number;
    account: string;
    resourcePath: string;
    distributeAccount?: string;
}

type EditorAction = ThunkAction<any, RootState, any, FIX_MY_TYPE>;

function setAccountQuotaImpl(params: AccountQuotaParams): Promise<void> {
    const {limit, limitDiff, account, resourcePath, distributeAccount} = params;
    const dotPath = resourcePath.replace(/\//g, '.');
    if (!limitDiff) {
        return Promise.resolve();
    }
    if (!distributeAccount) {
        return setAccountLimit(limit, account, RESOURCES_LIMITS_PREFIX + resourcePath);
    } else if (limitDiff > 0) {
        return yt.v4.transferAccountResources({
            parameters: {
                source_account: distributeAccount,
                destination_account: account,
                resource_delta: _.update({}, dotPath, () => limitDiff),
            },
        });
    } else {
        return yt.v4.transferAccountResources({
            parameters: {
                source_account: account,
                destination_account: distributeAccount,
                resource_delta: _.update({}, dotPath, () => -limitDiff),
            },
        });
    }
}

export function setAccountQuota(params: AccountQuotaParams): EditorAction {
    return (dispatch) => {
        const toasterName = params.account + '_' + params.resourcePath;
        return wrapApiPromiseByToaster(setAccountQuotaImpl(params), {
            toasterName,
            successContent: 'The quota is updated',
        }).then(() => {
            dispatch(loadEditedAccount(params.account));
            dispatch(accountsIncreaseEditCounter());
        });
    };
}
