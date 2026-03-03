import {useCallback} from 'react';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';

import {
    getDescriptionType,
    getEdittingAnnotation,
    getIsSaving,
    setEdittingAnnotation,
    setSaving,
    toggleEditMode,
} from '../../../../store/reducers/navigation/description';

import {selectCluster} from '../../../../store/selectors/global';
import {
    udpateAnnotaionExternal,
    useAnnotationQuery,
} from '../../../../store/api/navigation/tabs/description';
import {getPath} from '../../../../store/selectors/navigation';

import {useUpdateAnnotation} from './use-update-annotaton';

export function useDescriptionActions() {
    const dispatch = useDispatch();

    const path = useSelector(getPath);
    const cluster = useSelector(selectCluster);
    const edittingAnnotation = useSelector(getEdittingAnnotation);
    const type = useSelector(getDescriptionType);
    const isSaving = useSelector(getIsSaving);

    const [updateFn, {isLoading}] = useUpdateAnnotation();
    const {data} = useAnnotationQuery({path, cluster});

    const edit = useCallback(() => {
        dispatch(toggleEditMode());
    }, [type, dispatch]);

    const cancel = useCallback(() => {
        dispatch(setEdittingAnnotation({edittingAnnotation: data}));
        dispatch(toggleEditMode());
    }, [data, dispatch]);

    const save = useCallback(async () => {
        dispatch(setSaving({isSaving: true}));
        if (type === 'yt') {
            await updateFn(edittingAnnotation || '');
        } else {
            await dispatch(
                udpateAnnotaionExternal({cluster, path, value: edittingAnnotation ?? ''}),
            );
        }
        dispatch(setSaving({isSaving: false}));
        dispatch(toggleEditMode());
    }, [updateFn, edittingAnnotation, type, dispatch]);

    return {edit, cancel, save, isLoading, isSaving};
}
