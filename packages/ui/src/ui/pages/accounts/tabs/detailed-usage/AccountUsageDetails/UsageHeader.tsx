import React from 'react';

import {type AccountUsageField} from '../../../../../store/reducers/accounts/usage/account-usage-types';
import {useSelector} from '../../../../../store/redux-hooks';
import {selectAccountUsageViewType} from '../../../../../store/selectors/accounts/account-usage';

import {useVersionedFieldName} from './useVersionedFieldName';
import {Header} from './Header';
import {VersionedHeader} from './VersionedHeader';

type Props = {
    column: AccountUsageField;
};

export const UsageHeader = ({column}: Props) => {
    const viewType = useSelector(selectAccountUsageViewType);
    const showVersionedHeader = !viewType?.endsWith('-diff');

    const versionedField = useVersionedFieldName(column);

    return showVersionedHeader && versionedField ? (
        <VersionedHeader column={column} versionedColumn={versionedField} />
    ) : (
        <Header column={column} />
    );
};
