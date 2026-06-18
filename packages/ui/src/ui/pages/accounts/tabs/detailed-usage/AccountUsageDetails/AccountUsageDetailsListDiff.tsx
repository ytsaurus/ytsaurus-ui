import React, {useEffect} from 'react';

import {DataTableYT} from '../../../../../components/DataTableYT';
import {YTErrorBlock} from '../../../../../containers/Block/Block';
import {fetchAccountUsageListDiff} from '../../../../../store/actions/accounts/account-usage-diff';
import {useDispatch, useSelector} from '../../../../../store/redux-hooks';
import {
    selectAccountUsageListDiffError,
    selectAccountUsageListDiffItems,
    selectAccountUsageListDiffLoaded,
    selectAccountUsageListDiffLoading,
    selectAccountUsageListDiffMediums,
} from '../../../../../store/selectors/accounts/account-usage';

import {ROW_CLASS_NAME, TABLE_SETTINGS} from './constants';
import {useColumnsByPreset} from './useColumnsByPreset';

const AccountUsageDetailsListDiffImpl = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchAccountUsageListDiff());
    }, [dispatch]);

    const items = useSelector(selectAccountUsageListDiffItems);
    const loading = useSelector(selectAccountUsageListDiffLoading);
    const loaded = useSelector(selectAccountUsageListDiffLoaded);
    const error = useSelector(selectAccountUsageListDiffError);

    const mediums = useSelector(selectAccountUsageListDiffMediums);
    const columns = useColumnsByPreset(mediums);

    if (!loading && error) {
        return <YTErrorBlock error={error} />;
    }

    return (
        <DataTableYT
            loading={loading}
            loaded={loaded}
            columns={columns}
            data={items}
            settings={TABLE_SETTINGS}
            rowClassName={() => ROW_CLASS_NAME}
            useThemeYT
        />
    );
};

export const AccountUsageDetailsListDiff = React.memo(AccountUsageDetailsListDiffImpl);
