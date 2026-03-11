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
import {
    udpateAnnotaionExternal,
    useAnnotationQuery,
} from '../../../../store/api/navigation/tabs/description';
import {getCluster} from '../../../../store/selectors/global';
import {getPath} from '../../../../store/selectors/navigation';

import {useUpdateAnnotation} from './use-update-annotaton';
import {useExternalAnnotation} from './use-external-annotation';
import {useYTAnnotation} from './use-yt-annotation';

export function useDescriptionActions() {
    const dispatch = useDispatch();

    const path = useSelector(getPath);
    const cluster = useSelector(getCluster);
    const type = useSelector(getDescriptionType);
    const isSaving = useSelector(getIsSaving);

    const [updateFn, {isLoading}] = useUpdateAnnotation();
    const {data} = useAnnotationQuery({path, cluster});

    const externalDescription = useExternalAnnotation();
    const {ytAnnotation} = useYTAnnotation();

    const edittingAnnotation = useSelector(getEdittingAnnotation);

    const edit = useCallback(() => {
        dispatch(startEdit({externalDescription, annotation: ytAnnotation}));
    }, [type, externalDescription, ytAnnotation, dispatch]);

    const cancel = useCallback(() => {
        dispatch(stopEdit());
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
        dispatch(stopEdit());
    }, [updateFn, edittingAnnotation, type, dispatch]);

    return {edit, cancel, save, isLoading, isSaving};
}
