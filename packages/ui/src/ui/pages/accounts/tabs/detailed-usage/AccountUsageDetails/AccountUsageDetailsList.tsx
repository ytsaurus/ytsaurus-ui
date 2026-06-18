import React, {useCallback} from 'react';

import {DataTableYT} from '../../../../../components/DataTableYT';
import {YTErrorBlock} from '../../../../../containers/Block/Block';
import {useUpdater} from '../../../../../hooks/use-updater';
import {fetchAccountUsageList} from '../../../../../store/actions/accounts/account-usage';
import {useDispatch, useSelector} from '../../../../../store/redux-hooks';
import {
    selectAccountUsageCurrentSnapshot,
    selectAccountUsageListError,
    selectAccountUsageListItems,
    selectAccountUsageListLoaded,
    selectAccountUsageListLoading,
    selectAccountUsageListMediums,
} from '../../../../../store/selectors/accounts/account-usage';

import {ROW_CLASS_NAME, TABLE_SETTINGS, UPDATE_TIMEOUT} from './constants';
import {useColumnsByPreset} from './useColumnsByPreset';

const AccountUsageDetailsListImpl = () => {
    const dispatch = useDispatch();

    const currentSnapshot = useSelector(selectAccountUsageCurrentSnapshot);

    const updateFn = useCallback(() => {
        dispatch(fetchAccountUsageList());
    }, [dispatch]);

    useUpdater(updateFn, {timeout: UPDATE_TIMEOUT, onlyOnce: currentSnapshot !== undefined});

    const items = useSelector(selectAccountUsageListItems);
    const loading = useSelector(selectAccountUsageListLoading);
    const loaded = useSelector(selectAccountUsageListLoaded);
    const error = useSelector(selectAccountUsageListError);

    const mediums = useSelector(selectAccountUsageListMediums);
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

export const AccountUsageDetailsList = React.memo(AccountUsageDetailsListImpl);
