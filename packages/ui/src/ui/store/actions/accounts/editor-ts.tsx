import {type ThunkAction} from 'redux-thunk';
import {type RootState} from '../../../store/reducers';
import {type FIX_MY_TYPE} from '../../../types';
import {createAccount, createAccountHome, setAccountAbc} from '../../../utils/accounts/editor';
import {ROOT_ACCOUNT_NAME} from '../../../constants/accounts/accounts';
import {IdmObjectType} from '../../../constants/acl';
import {updateAcl} from '../../../store/actions/acl';
import UIFactory from '../../../UIFactory';
import {type ResponsibleType} from '../../../utils/acl/acl-types';
import {accountsIncreaseEditCounter} from './accounts';
import {accountsApi} from '../../../store/api/accounts';
import {YTApiId} from '../../../rum/rum-wrap-api';

type EditorAction = ThunkAction<any, RootState, any, FIX_MY_TYPE>;

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

        return createAccount(account, parentAccount)
            .then(() => {
                const {id, slug} = abcService || {};

                return Promise.all([
                    setAccountAbc(account, id, slug).catch(() => {}),
                    createHome ? createAccountHome(account).catch(() => {}) : Promise.resolve(),
                    dispatch(
                        setResponsibleUsers(
                            responsibles,
                            account,
                            parentAccount !== ROOT_ACCOUNT_NAME,
                        ),
                    ).catch(() => {}),
                ]);
            })
            .then((result: unknown[]) => {
                dispatch(
                    accountsApi.util.invalidateTags([
                        YTApiId.listAccounts,
                        YTApiId.accountsEditData,
                    ]),
                );
                dispatch(accountsIncreaseEditCounter());
                return result;
            });
    };
}
