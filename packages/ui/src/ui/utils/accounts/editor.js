import reduce_ from 'lodash/reduce';

import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import {ROOT_ACCOUNT_NAME} from '../../constants/accounts/accounts';
import {EDITOR_TABS} from '../../constants/accounts/editor';
import hammer from '../../common/hammer';
import {Toaster} from '@gravity-ui/uikit';
import {IdmObjectType} from '../../constants/acl';
import {showErrorPopup} from '../../utils/utils';
import {updateAcl} from '../../utils/acl/acl-api';

const basePath = '//sys/accounts/';

const toaster = new Toaster();

const ERRRO_TOASTER_TIMEOUT = 10000;
const SUCCESS_TOASTER_TIMEOUT = 5000;

export function setResponsibleUsers(cluster, users, accountName, inheritAcl) {
    const path = accountName;

    return updateAcl(cluster, path, {
        idmKind: IdmObjectType.ACCOUNT,
        responsible: users,
        inheritAcl,
    });
}

export function setAccountLimit(input, accountName, resourcePath) {
    const path = basePath + accountName + resourcePath;
    return yt.v3.set({path}, input);
}

export function createAccountFromInfo(cluster, newAccountInfo) {
    return () => {
        const {abcService, account, parentAccount, responsibles, createHome} = newAccountInfo;

        return createAccount(account, parentAccount).then(() => {
            const {id, slug} = abcService || {};

            return Promise.all([
                setAccountAbc(account, id, slug).catch(() => {}),
                createHome ? createAccountHome(account).catch(() => {}) : Promise.resolve(),
                setResponsibleUsers(
                    cluster,
                    responsibles,
                    account,
                    parentAccount !== ROOT_ACCOUNT_NAME,
                ).catch(() => {}),
            ]);
        });
    };
}

function createAccount(accountName, parentName) {
    return yt.v3
        .create({
            type: 'account',
            attributes: {
                name: accountName,
                parent_name: parentName,
            },
        })
        .then((d) => {
            toaster.add({
                name: 'create account',
                timeout: SUCCESS_TOASTER_TIMEOUT,
                theme: 'success',
                title: `${accountName} successfully created`,
            });
            return d;
        })
        .catch((err) => {
            toaster.add({
                name: 'create account',
                timeout: ERRRO_TOASTER_TIMEOUT,
                theme: 'danger',
                title: `Failed to create account ${accountName}`,
                content: err.message,
                actions: [{label: ' view', onClick: () => showErrorPopup(err)}],
            });
            return Promise.reject(err);
        });
}

export function setAccountParent(accountName, parentName) {
    return yt.v3
        .set({path: basePath + accountName + '/@parent_name'}, parentName)
        .then((d) => {
            toaster.add({
                name: 'set parent for account',
                timeout: SUCCESS_TOASTER_TIMEOUT,
                theme: 'success',
                title: `${accountName}'s Parent updated successfully`,
            });
            return d;
        })
        .catch((err) => {
            toaster.add({
                name: 'set parent for account',
                timeout: ERRRO_TOASTER_TIMEOUT,
                theme: 'danger',
                title: `Failed to set Parent for ${accountName}`,
                content: err.message,
                actions: [{label: ' view', onClick: () => showErrorPopup(err)}],
            });
            return Promise.reject(err);
        });
}

export function setAccountAbc(accountName, abcId, abcSlug) {
    if (!abcId || !abcSlug) {
        return Promise.resolve();
    }
    return yt.v3
        .set({path: basePath + accountName + '/@abc'}, {id: abcId, slug: abcSlug})
        .then((d) => {
            toaster.add({
                name: 'account abc service',
                timeout: SUCCESS_TOASTER_TIMEOUT,
                theme: 'success',
                title: `${accountName}'s ABC Service updated successfully`,
            });
            return d;
        })
        .catch((err) => {
            toaster.add({
                name: 'account abc service',
                timeout: ERRRO_TOASTER_TIMEOUT,
                theme: 'danger',
                title: `Failed to set ABC for ${accountName}`,
                content: err.message,
                actions: [{label: ' view', onClick: () => showErrorPopup(err)}],
            });
            return Promise.reject(err);
        });
}

export function createAccountHome(accountName) {
    return yt.v3
        .set(
            {
                path: `//sys/accounts/${accountName}/@resource_limits/node_count`,
            },
            1,
        )
        .then(() => {
            return yt.v3
                .create({
                    type: 'map_node',
                    path: '//home/' + accountName,
                    attributes: {
                        account: accountName,
                    },
                })
                .then((d) => {
                    toaster.add({
                        name: 'account create home',
                        timeout: SUCCESS_TOASTER_TIMEOUT,
                        theme: 'success',
                        title: `${accountName}'s home directory created successfully`,
                    });
                    return d;
                });
        })
        .catch((err) => {
            toaster.add({
                name: 'account create home',
                timeout: ERRRO_TOASTER_TIMEOUT,
                theme: 'danger',
                title: `Failed to create home for ${accountName}`,
                content: err.message,
                actions: [{label: ' view', onClick: () => showErrorPopup(err)}],
            });
            return Promise.reject(err);
        });
}

export function deleteAccount(accountName) {
    return yt.v3.remove({
        path: '//sys/accounts/' + accountName,
    });
}

export function parseNumber(input) {
    const result = input.trim();

    return Math.floor(Number(result));
}

export const contentTabs = reduce_(
    EDITOR_TABS,
    (acc, value) => {
        acc.push({
            value,
            text: hammer.format['ReadableField'](value),
            show: true,
        });
        return acc;
    },
    [],
);
