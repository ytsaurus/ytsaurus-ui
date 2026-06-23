import {objHasOwnProperty} from '../../../../../../shared/utils/toolkit';
import {
    type AccountUsageField,
    type AccountUsageVersionedField,
} from '../../../../../store/reducers/accounts/usage/account-usage-types';
import {useSelector} from '../../../../../store/redux-hooks';
import {selectAccountUsageVersionedFields} from '../../../../../store/selectors/accounts/account-usage';

export const useVersionedFieldName = (
    field: AccountUsageField,
): AccountUsageVersionedField | undefined => {
    const versionedFields = useSelector(selectAccountUsageVersionedFields);

    if (!versionedFields || !objHasOwnProperty(versionedFields, field)) {
        return undefined;
    }

    return versionedFields[field];
};
