import {useCallback, useState} from 'react';
import {useSelector} from 'react-redux';
import {useThunkDispatch} from '../../../store/thunkDispatch';
import {
    getCurrentDraftQueryACO,
    getCurrentQueryACO,
} from '../../../store/selectors/query-tracker/query';
import {
    getQueryACOOptions,
    isQueryTrackerInfoLoading as isQueryTrackerInfoLoadingSelector,
    selectQueryTrackerInfo,
} from '../../../store/selectors/query-tracker/queryAco';
import {getQueryTrackerInfo} from '../../../store/actions/query-tracker/queryAco';
import {setDraftQueryACO, setQueryACO} from '../../../store/actions/query-tracker/query';

export const useQueryACO = () => {
    const dispatch = useThunkDispatch();
    const currentQueryACO = useSelector(getCurrentQueryACO);
    const currentDraftQueryACO = useSelector(getCurrentDraftQueryACO);
    const selectOptions = useSelector(getQueryACOOptions);
    const isQueryTrackerInfoLoading = useSelector(isQueryTrackerInfoLoadingSelector);
    const trackerInfo = useSelector(selectQueryTrackerInfo);
    const [loading, setLoading] = useState(false);

    const changeCurrentQueryACO = useCallback(
        ({aco, query_id}: {aco: string[]; query_id: string}) => {
            if (!query_id) {
                throw new Error('query_id is empty');
            }

            setLoading(true);

            return dispatch(setQueryACO({aco, query_id})).finally(() => setLoading(false));
        },
        [dispatch],
    );

    const changeDraftQueryACO = useCallback(
        ({aco}: {aco: string[]}) => {
            setLoading(true);

            return dispatch(setDraftQueryACO({aco})).finally(() => setLoading(false));
        },
        [dispatch],
    );

    const loadQueryTrackerInfo = () => {
        dispatch(getQueryTrackerInfo());
    };

    return {
        selectACOOptions: selectOptions,
        currentQueryACO,
        changeDraftQueryACO,
        changeCurrentQueryACO,
        currentDraftQueryACO,
        trackerInfo,
        loadQueryTrackerInfo,
        isFlight: loading || isQueryTrackerInfoLoading,
        isQueryTrackerInfoLoading,
    };
};
