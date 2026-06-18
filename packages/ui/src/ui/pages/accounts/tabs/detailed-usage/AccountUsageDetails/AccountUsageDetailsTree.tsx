import React, {useCallback} from 'react';

import {DataTableYT} from '../../../../../components/DataTableYT';
import {YTErrorBlock} from '../../../../../containers/Block/Block';
import {useUpdater} from '../../../../../hooks/use-updater';
import {fetchAccountUsageTree} from '../../../../../store/actions/accounts/account-usage';
import {useDispatch, useSelector} from '../../../../../store/redux-hooks';
import {
    selectAccountUsageCurrentSnapshot,
    selectAccountUsageTreeError,
    selectAccountUsageTreeItems,
    selectAccountUsageTreeLoaded,
    selectAccountUsageTreeLoading,
    selectAccountUsageTreeMediums,
} from '../../../../../store/selectors/accounts/account-usage';

import {ROW_CLASS_NAME, TABLE_SETTINGS_DOUBLE_TOOLBAR, UPDATE_TIMEOUT} from './constants';
import {useColumnsByPreset} from './useColumnsByPreset';

const AccountUsageDetailsTreeImpl = () => {
    const dispatch = useDispatch();

    const currentSnapshot = useSelector(selectAccountUsageCurrentSnapshot);

    const updateFn = useCallback(() => {
        dispatch(fetchAccountUsageTree());
    }, [dispatch]);

    useUpdater(updateFn, {timeout: UPDATE_TIMEOUT, onlyOnce: currentSnapshot !== undefined});

    const items = useSelector(selectAccountUsageTreeItems);
    const loading = useSelector(selectAccountUsageTreeLoading);
    const loaded = useSelector(selectAccountUsageTreeLoaded);
    const error = useSelector(selectAccountUsageTreeError);

    const mediums = useSelector(selectAccountUsageTreeMediums);
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
            settings={TABLE_SETTINGS_DOUBLE_TOOLBAR}
            rowClassName={() => ROW_CLASS_NAME}
            useThemeYT
        />
    );
};

export const AccountUsageDetailsTree = React.memo(AccountUsageDetailsTreeImpl);
