export function importManageTokens() {
    return import(/* webpackChunkName: "manage-tokens" */ './index.impl');
}

export {ManageTokensModal} from './ManageTokensModal';
