import {useCallback} from 'react';

import {objHasOwnProperty} from '../../../../../../shared/utils/toolkit';
import {
    type AccountUsageDataItem,
    type AccountUsageField,
} from '../../../../../store/reducers/accounts/usage/account-usage-types';
import {useSelector} from '../../../../../store/redux-hooks';
import {selectAccountUsageVersionedFields} from '../../../../../store/selectors/accounts/account-usage';

type Result = (item: AccountUsageDataItem, field: AccountUsageField) => number | null;

export const useGetVersionedFieldValue = (): Result => {
    const versionedFields = useSelector(selectAccountUsageVersionedFields);

    return useCallback(
        (item, field) => {
            if (!versionedFields) {
                return null;
            }

            const versionedField = objHasOwnProperty(versionedFields, field)
                ? versionedFields[field]
                : null;

            if (!versionedField) {
                return null;
            }

            return item[versionedField] ?? null;
        },
        [versionedFields],
    );
};
