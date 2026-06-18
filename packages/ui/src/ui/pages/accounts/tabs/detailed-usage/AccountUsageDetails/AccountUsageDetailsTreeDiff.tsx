import React, {useEffect} from 'react';

import {DataTableYT} from '../../../../../components/DataTableYT';
import {YTErrorBlock} from '../../../../../containers/Block/Block';
import {fetchAccountUsageTreeDiff} from '../../../../../store/actions/accounts/account-usage-diff';
import {useDispatch, useSelector} from '../../../../../store/redux-hooks';
import {
    selectAccountUsageTreeDiffError,
    selectAccountUsageTreeDiffItems,
    selectAccountUsageTreeDiffLoaded,
    selectAccountUsageTreeDiffLoading,
    selectAccountUsageTreeDiffMediums,
} from '../../../../../store/selectors/accounts/account-usage';

import {ROW_CLASS_NAME, TABLE_SETTINGS_DOUBLE_TOOLBAR} from './constants';
import {useColumnsByPreset} from './useColumnsByPreset';

const AccountUsageDetailsTreeDiffImpl = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchAccountUsageTreeDiff());
    }, [dispatch]);

    const items = useSelector(selectAccountUsageTreeDiffItems);
    const loading = useSelector(selectAccountUsageTreeDiffLoading);
    const loaded = useSelector(selectAccountUsageTreeDiffLoaded);
    const error = useSelector(selectAccountUsageTreeDiffError);

    const mediums = useSelector(selectAccountUsageTreeDiffMediums);
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

export const AccountUsageDetailsTreeDiff = React.memo(AccountUsageDetailsTreeDiffImpl);
