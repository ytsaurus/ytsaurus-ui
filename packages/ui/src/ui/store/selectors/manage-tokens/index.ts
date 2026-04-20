import {createSelector} from 'reselect';
import {type RootState} from '../../reducers';
import {selectAuthWay} from '../global';
import {selectRequirePasswordInAuthenticationCommands} from '../global/supported-features';

export type AuthenticationToken = {
    tokenHash: string;
    description?: string;
    creationTime?: string;
    tokenPrefix?: string;
};

export const selectManageTokens = createSelector(
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

export const selectIsManageTokensModalOpened = (state: RootState) => state.manageTokens.modal.open;

export const selectIsManageTokensInOAuthMode = createSelector(
    [selectAuthWay, selectRequirePasswordInAuthenticationCommands],
    (authWay, requirePasswordInAuthenticationCommands) => {
        return authWay === 'oauth' && !requirePasswordInAuthenticationCommands;
    },
);

export const selectAllowManageTokens = (state: RootState) => {
    const authWay = selectAuthWay(state);

    if (authWay === 'passwd') {
        return true;
    }

    return selectIsManageTokensInOAuthMode(state);
};
