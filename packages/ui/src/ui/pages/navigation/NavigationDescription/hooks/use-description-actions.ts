import {useCallback} from 'react';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';

import {
    getDescriptionType,
    getEdittingAnnotation,
    getIsSaving,
    setSaving,
    startEdit,
    stopEdit,
} from '../../../../store/reducers/navigation/description';

import {selectCluster} from '../../../../store/selectors/global';
import {udpateAnnotationExternal} from '../../../../store/api/navigation/tabs/description';
import {selectPath} from '../../../../store/selectors/navigation';

import {useUpdateAnnotation} from './use-update-annotaton';
import {useExternalAnnotation} from './use-external-annotation';
import {useYTAnnotation} from './use-yt-annotation';

export function useDescriptionActions() {
    const dispatch = useDispatch();

    const path = useSelector(selectPath);

    const cluster = useSelector(selectCluster);
    const edittingAnnotation = useSelector(getEdittingAnnotation);

    const type = useSelector(getDescriptionType);
    const isSaving = useSelector(getIsSaving);

    const [updateFn, {isLoading}] = useUpdateAnnotation();

    const externalDescription = useExternalAnnotation();
    const {ytAnnotation} = useYTAnnotation();

    const edit = useCallback(() => {
        dispatch(startEdit({externalDescription, annotation: ytAnnotation}));
    }, [externalDescription, ytAnnotation, dispatch]);

    const cancel = useCallback(() => {
        dispatch(stopEdit());
    }, [dispatch]);

    const save = useCallback(async () => {
        dispatch(setSaving({isSaving: true}));
        try {
            if (type === 'yt') {
                await updateFn(edittingAnnotation || '');
            } else {
                await dispatch(
                    udpateAnnotationExternal({cluster, path, value: edittingAnnotation ?? ''}),
                );
            }
            dispatch(stopEdit());
        } catch {
            // Both save paths display the error; keep the draft open for another attempt.
            return;
        } finally {
            dispatch(setSaving({isSaving: false}));
        }
    }, [updateFn, edittingAnnotation, type, dispatch, cluster, path]);

    return {edit, cancel, save, isLoading, isSaving};
}
