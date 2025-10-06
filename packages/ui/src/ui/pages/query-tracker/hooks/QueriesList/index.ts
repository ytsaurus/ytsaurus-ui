import {useDispatch, useSelector} from 'react-redux';
import {setSettingByKey} from '../../../../store/actions/settings';
import {getSettingQueryTrackerQueriesListSidebarVisibilityMode} from '../../../../store/selectors/query-tracker/settings';

export const useQueriesListSidebarToggle = () => {
    const dispatch = useDispatch();
    const isQueriesListSidebarVisible = useSelector(
        getSettingQueryTrackerQueriesListSidebarVisibilityMode,
    );

    const toggleQueriesListSideBarToggle = () => {
        dispatch(
            setSettingByKey(
                'global::queryTracker::queriesListSidebarVisibilityMode',
                !isQueriesListSidebarVisible,
            ),
        );
    };

    return {
        isQueriesListSidebarVisible,
        toggleQueriesListSideBarToggle,
    };
};
