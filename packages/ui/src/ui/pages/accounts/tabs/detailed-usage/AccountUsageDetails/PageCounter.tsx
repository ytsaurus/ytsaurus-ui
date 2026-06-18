import React from 'react';

import {Secondary} from '@ytsaurus/components';

import {useSelector} from '../../../../../store/redux-hooks';
import {
    selectAccountUsagePageCount,
    selectAccountUsagePageIndex,
} from '../../../../../store/selectors/accounts/account-usage';

import i18n from '../i18n';

const PageCounterImpl = () => {
    const value = useSelector(selectAccountUsagePageIndex);
    const count = useSelector(selectAccountUsagePageCount);

    return count > 1 ? (
        <Secondary>
            {i18n('field_page')} {Number(value) + 1} / {count}{' '}
        </Secondary>
    ) : null;
};

export const PageCounter = React.memo(PageCounterImpl);
