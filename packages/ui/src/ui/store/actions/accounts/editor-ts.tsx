import update_ from 'lodash/update';
import {type ThunkAction} from 'redux-thunk';
import {type RootState} from '../../../store/reducers';
import {type FIX_MY_TYPE} from '../../../types';
import {
    createAccount,
    createAccountHome,
    setAccountAbc,
    setAccountLimit,
} from '../../../utils/accounts/editor';
// @ts-ignore
import yt from '@ytsaurus/javascript-wrapper/lib/yt';
import {RESOURCES_LIMITS_PREFIX} from '../../../constants/accounts';
import {ROOT_ACCOUNT_NAME} from '../../../constants/accounts/accounts';
import {IdmObjectType} from '../../../constants/acl';
import {selectCluster} from '../../../store/selectors/global';
import {updateAcl} from '../../../utils/acl/acl-api';
import {type ResponsibleType} from '../../../utils/acl/acl-types';
import {wrapApiPromiseByToaster} from '../../../utils/utils';
import {accountsIncreaseEditCounter, loadEditedAccount} from './accounts';
import i18n from './i18n';

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
                resource_delta: update_({}, dotPath, () => limitDiff),
            },
        });
    } else {
        return yt.v4.transferAccountResources({
            parameters: {
                source_account: account,
                destination_account: distributeAccount,
                resource_delta: update_({}, dotPath, () => -limitDiff),
            },
        });
    }
}

export function setAccountQuota(params: AccountQuotaParams): EditorAction {
    return (dispatch) => {
        const toasterName = params.account + '_' + params.resourcePath;
        return wrapApiPromiseByToaster(setAccountQuotaImpl(params), {
            toasterName,
            successContent: i18n('alert_quota-updated'),
        }).then(() => {
            dispatch(loadEditedAccount(params.account));
            dispatch(accountsIncreaseEditCounter());
        });
    };
}

function setResponsibleUsers(
    users: Array<ResponsibleType>,
    accountName: string,
    inheritAcl: boolean,
): EditorAction {
    return (_dispatch, getState) => {
        const path = accountName;
        const cluster = selectCluster(getState());

        return updateAcl(cluster, path, {
            idmKind: IdmObjectType.ACCOUNT,
            responsible: users,
            inheritAcl,
        });
    };
}

export interface NewAccountInfo {
    abcService?: {slug: string; id: number};
    account: string;
    parentAccount: string;
    responsibles: Array<ResponsibleType>;
    createHome: boolean;
}

export function createAccountFromInfo(newAccountInfo: NewAccountInfo): EditorAction {
    return (dispatch) => {
        const {abcService, account, parentAccount, responsibles, createHome} = newAccountInfo;

        return createAccount(account, parentAccount).then(() => {
            const {id, slug} = abcService || {};

            return Promise.all([
                setAccountAbc(account, id, slug).catch(() => {}),
                createHome ? createAccountHome(account).catch(() => {}) : Promise.resolve(),
                dispatch(
                    setResponsibleUsers(responsibles, account, parentAccount !== ROOT_ACCOUNT_NAME),
                ).catch(() => {}),
            ]);
        });
    };
}
