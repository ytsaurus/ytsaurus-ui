import {createSelector} from 'reselect';
import {RootState} from '../../reducers';
import {getAuthWay} from '../global';
import {getConfigData} from '../../../config/ui-settings';

export type AuthenticationToken = {
    tokenHash: string;
    description?: string;
    creationTime?: string;
    tokenPrefix?: string;
};

export const manageTokensSelector = createSelector(
    [(state: RootState) => state.manageTokens.tokens?.data],
    (tokens) => {
        if (Array.isArray(tokens)) {
            return tokens.map((token) => ({
                tokenHash: token,
            }));
        }

        return Object.entries(tokens ?? {}).map(([key, value]) => {
            return {
                tokenHash: key,
                description: value.description,
                creationTime: value.creation_time,
                tokenPrefix: value.token_prefix,
            };
        });
    },
);

export const isManageTokensModalOpened = (state: RootState) => state.manageTokens.modal.open;

export const isManageTokensInOAuthMode = createSelector(
    [getAuthWay, () => getConfigData().enableOauthModeForManageTokens],
    (authWay, enableOauthModeForManageTokens) => {
        return authWay === 'oauth' && enableOauthModeForManageTokens;
    },
);

export const shouldManageTokens = (state: RootState) => {
    const authWay = getAuthWay(state);

    if (authWay === 'passwd') {
        return true;
    }

    return isManageTokensInOAuthMode(state);
};
