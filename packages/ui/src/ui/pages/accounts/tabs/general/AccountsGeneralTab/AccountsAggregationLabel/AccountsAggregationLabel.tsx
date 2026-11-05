import React from 'react';
import {Flex} from '@gravity-ui/uikit';

import Loader from '../../../../../../components/Loader/Loader';
import {useSelector} from '../../../../../../store/redux-hooks';
import i18n from '../../i18n';

export function AccountsAggregationLabel() {
    const loading = useSelector(
        ({accounts: {accounts}}) => accounts.fetching || accounts.metadataFetching,
    );

    return (
        <Flex alignItems="center" gap="1">
            {i18n('value_aggregation')}
            {loading && (
                <span data-qa="accounts-aggregation-loading">
                    <Loader visible />
                </span>
            )}
        </Flex>
    );
}
