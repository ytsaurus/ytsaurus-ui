import reduce_ from 'lodash/reduce';

import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import {ROOT_ACCOUNT_NAME} from '../../constants/accounts/accounts';
import {EDITOR_TABS} from '../../constants/accounts/editor';
import {IdmObjectType} from '../../constants/acl';
import {showErrorPopup} from '../../utils/utils';
import {updateAcl} from '../../utils/acl/acl-api';
import {toaster} from '../toaster';
import i18n from './i18n';

const basePath = '//sys/accounts/';

const ERROR_TOASTER_TIMEOUT = 10000;
const SUCCESS_TOASTER_TIMEOUT = 5000;

const EDITOR_TAB_LABELS = {
    [EDITOR_TABS.general]: () => i18n('value_general'),
    [EDITOR_TABS.medium]: () => i18n('value_disk-space'),
    [EDITOR_TABS.nodes]: () => i18n('value_nodes'),
    [EDITOR_TABS.chunks]: () => i18n('value_chunks'),
    [EDITOR_TABS.tablets]: () => i18n('value_tablets'),
    [EDITOR_TABS.masterMemory]: () => i18n('value_master-memory'),
    [EDITOR_TABS.delete]: () => i18n('value_delete'),
};

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
                title: i18n('alert_account-created', {accountName}),
            });
            return d;
        })
        .catch((err) => {
            toaster.add({
                name: 'create account',
                timeout: ERROR_TOASTER_TIMEOUT,
                theme: 'danger',
                title: i18n('alert_create-account-failed', {accountName}),
                content: err.message,
                actions: [{label: i18n('action_view'), onClick: () => showErrorPopup(err)}],
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
                title: i18n('alert_account-parent-updated', {accountName}),
            });
            return d;
        })
        .catch((err) => {
            toaster.add({
                name: 'set parent for account',
                timeout: ERROR_TOASTER_TIMEOUT,
                theme: 'danger',
                title: i18n('alert_set-parent-failed', {accountName}),
                content: err.message,
                actions: [{label: i18n('action_view'), onClick: () => showErrorPopup(err)}],
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
                title: i18n('alert_account-abc-updated', {accountName}),
            });
            return d;
        })
        .catch((err) => {
            toaster.add({
                name: 'account abc service',
                timeout: ERROR_TOASTER_TIMEOUT,
                theme: 'danger',
                title: i18n('alert_set-abc-failed', {accountName}),
                content: err.message,
                actions: [{label: i18n('action_view'), onClick: () => showErrorPopup(err)}],
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
                        title: i18n('alert_account-home-created', {accountName}),
                    });
                    return d;
                });
        })
        .catch((err) => {
            toaster.add({
                name: 'account create home',
                timeout: ERROR_TOASTER_TIMEOUT,
                theme: 'danger',
                title: i18n('alert_create-home-failed', {accountName}),
                content: err.message,
                actions: [{label: i18n('action_view'), onClick: () => showErrorPopup(err)}],
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
            get text() {
                return EDITOR_TAB_LABELS[value]?.() ?? value;
            },
            show: true,
        });
        return acc;
    },
    [],
);
