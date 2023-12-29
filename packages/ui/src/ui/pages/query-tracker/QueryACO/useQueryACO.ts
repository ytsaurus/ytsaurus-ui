import {useCallback, useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import {useThunkDispatch} from '../../../store/thunkDispatch';
import {getCurrentDraftQueryACO, getCurrentQueryACO} from '../module/query/selectors';
import {getQueryACOOptions} from '../module/query_aco_list/selectors';
import {getQueryACOList} from '../module/query_aco_list/actions';
import {setDraftQueryACO, setQueryACO} from '../module/query/actions';

export const useQueryACO = () => {
    const dispatch = useThunkDispatch();
    const currentQueryACO = useSelector(getCurrentQueryACO);
    const currentDraftQueryACO = useSelector(getCurrentDraftQueryACO);
    const selectOptions = useSelector(getQueryACOOptions);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        dispatch(getQueryACOList()).finally(() => setLoading(false));
    }, [dispatch, getQueryACOList]);

    const changeCurrentQueryACO = useCallback(
        ({aco, query_id}: {aco: string; query_id: string}) => {
            if (!query_id) {
                throw new Error('query_id is empty');
            }

            setLoading(true);

            return dispatch(setQueryACO({aco, query_id})).finally(() => setLoading(false));
        },
        [dispatch],
    );

    const changeDraftQueryACO = useCallback(
        ({aco}: {aco: string}) => {
            setLoading(true);

            return dispatch(setDraftQueryACO({aco})).finally(() => setLoading(false));
        },
        [dispatch],
    );

    return {
        selectACOOptions: selectOptions,
        currentQueryACO,
        changeDraftQueryACO,
        changeCurrentQueryACO,
        currentDraftQueryACO,
        isFlight: loading,
    };
};
