import {createSelector} from 'reselect';
import {RootState} from '../../reducers';

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
