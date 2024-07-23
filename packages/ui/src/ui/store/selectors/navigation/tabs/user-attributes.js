import reduce_ from 'lodash/reduce';

import {createSelector} from 'reselect';
import {getAttributesWithTypes} from '../../../../store/selectors/navigation';

const getUserAttributeKeys = (state) => state.navigation.tabs.userAttributes.userAttributeKeys;

export const getUserAttributes = createSelector(
    [getAttributesWithTypes, getUserAttributeKeys],
    (attributes, userAttributeKeys) => {
        return reduce_(
            userAttributeKeys,
            (res, key) => {
                res[key.$value] = attributes[key.$value];
                return res;
            },
            {},
        );
    },
);
