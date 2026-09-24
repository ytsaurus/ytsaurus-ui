import {type ThunkAction} from 'redux-thunk';
import {type RootState} from '../../../store/reducers';
import {type FIX_MY_TYPE} from '../../../types';
import {createAccount, createAccountHome, setAccountAbc} from '../../../utils/accounts/editor';
import {ROOT_ACCOUNT_NAME} from '../../../constants/accounts/accounts';
import {IdmObjectType} from '../../../constants/acl';
import {updateAcl} from '../../../store/actions/acl';
import UIFactory from '../../../UIFactory';
import {type ResponsibleType} from '../../../utils/acl/acl-types';
import {wrapApiPromiseByToaster} from '../../../utils/utils';
import {accountsIncreaseEditCounter, loadEditedAccount} from './accounts';
import i18n from './i18n';
import {type AccountQuotaParams, setAccountQuotaImpl} from '../../../utils/accounts/account-quota';

export type {AccountQuotaParams};

type EditorAction = ThunkAction<any, RootState, any, FIX_MY_TYPE>;

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
    return (dispatch) => {
        if (!UIFactory.getAclApi().isAllowed) {
            return Promise.resolve();
        }

        return Promise.all([
            dispatch(
                updateAcl({
                    path: accountName,
                    idmKind: IdmObjectType.ACCOUNT,
                    values: {responsible: users},
                }),
            ),
            dispatch(
                updateAcl({
                    path: accountName,
                    idmKind: IdmObjectType.ACCOUNT,
                    values: {inheritAcl},
                }),
            ),
        ]);
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
