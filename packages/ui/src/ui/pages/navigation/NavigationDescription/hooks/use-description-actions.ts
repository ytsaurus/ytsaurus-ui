import {useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {
    getEdittingAnnotation,
    setEdittingAnnotation,
    toggleEditMode,
} from '../../../../store/reducers/navigation/description';
import {useAnnotationQuery} from '../../../../store/api/navigation/tabs/description';
import {getCluster} from '../../../../store/selectors/global';
import {getPath} from '../../../../store/selectors/navigation';

import {useUpdateAnnotation} from './use-update-annotaton';

export function useDescriptionActions() {
    const dispatch = useDispatch();

    const path = useSelector(getPath);
    const cluster = useSelector(getCluster);
    const edittingAnnotation = useSelector(getEdittingAnnotation);

    const [updateFn, {isLoading}] = useUpdateAnnotation();
    const {data} = useAnnotationQuery({path, cluster});

    const edit = useCallback(() => {
        dispatch(toggleEditMode());
    }, [dispatch]);

    const cancel = useCallback(() => {
        dispatch(setEdittingAnnotation({edittingAnnotation: data}));
        dispatch(toggleEditMode());
    }, [data, dispatch]);

    const save = useCallback(() => {
        updateFn(edittingAnnotation || '').then(() => {
            dispatch(toggleEditMode());
        });
    }, [updateFn, edittingAnnotation, dispatch]);

    return {edit, cancel, save, isLoading};
}
