import _ from 'lodash';
import {createSelector} from 'reselect';
import {getAttributesWithTypes} from '../../../../store/selectors/navigation';

const getUserAttributeKeys = (state) => state.navigation.tabs.userAttributes.userAttributeKeys;

export const getUserAttributes = createSelector(
    [getAttributesWithTypes, getUserAttributeKeys],
    (attributes, userAttributeKeys) => {
        return _.reduce(
            userAttributeKeys,
            (res, key) => {
                res[key.$value] = attributes[key.$value];
                return res;
            },
            {},
        );
    },
);
