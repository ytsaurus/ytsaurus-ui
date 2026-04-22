import {useCallback, useState} from 'react';
import {useDispatch, useSelector} from '../../../store/redux-hooks';
import {
    selectCurrentDraftQueryACO,
    selectCurrentQueryACO,
} from '../../../store/selectors/query-tracker/query';
import {
    selectIsQueryTrackerInfoLoading,
    selectQueryACOOptions,
    selectQueryTrackerInfo,
} from '../../../store/selectors/query-tracker/queryAco';
import {getQueryTrackerInfo} from '../../../store/actions/query-tracker/queryAco';
import {setDraftQueryACO, setQueryACO} from '../../../store/actions/query-tracker/query';

export const useQueryACO = () => {
    const dispatch = useDispatch();
    const currentQueryACO = useSelector(selectCurrentQueryACO);
    const currentDraftQueryACO = useSelector(selectCurrentDraftQueryACO);
    const selectOptions = useSelector(selectQueryACOOptions);
    const isQueryTrackerInfoLoading = useSelector(selectIsQueryTrackerInfoLoading);
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
