import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {setSettingByKey} from '../../../../store/actions/settings';
import {selectSettingQueryTrackerQueriesListSidebarVisibilityMode} from '../../../../store/selectors/query-tracker/settings';

export const useQueriesListSidebarToggle = () => {
    const dispatch = useDispatch();
    const isQueriesListSidebarVisible = useSelector(
        selectSettingQueryTrackerQueriesListSidebarVisibilityMode,
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
