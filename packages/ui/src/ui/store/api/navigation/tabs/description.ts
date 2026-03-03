import {Action, ThunkAction} from '@reduxjs/toolkit';
import {YTApiId, ytApiV3} from '../../../../rum/rum-wrap-api';
import {rootApi} from '../../../../store/api';
import type {RootState} from '../../../../store/reducers';
import {getExternalDescription} from '../../../../store/selectors/navigation/description';
import UIFactory, {ExternalAnnotationResponse} from '../../../../UIFactory';
import {prepareRequest} from '../../../../utils/navigation';
import {wrapApiPromiseByToaster} from '../../../../utils/utils';

const descriptionQuery = async (args: {cluster: string; path: string}) => {
    const {cluster, path} = args;
    try {
        const data = await UIFactory?.externalAnnotationSetup?.load(cluster, path);
        return {data};
    } catch (error) {
        return {error};
    }
};

const annotationQuery = async (args: {cluster: string; path: string}) => {
    const {path} = args;
    try {
        const response = await ytApiV3.executeBatch({
            parameters: {
                requests: [
                    {
                        command: 'get' as const,
                        parameters: prepareRequest('/@annotation', {
                            path,
                        }),
                    },
                ],
            },
        });

        const data = response?.[0]?.output || '';

        return {data};
    } catch (error) {
        return {error};
    }
};

export const descriptionApi = rootApi.injectEndpoints({
    endpoints: (build) => ({
        externalDescription: build.query<
            ExternalAnnotationResponse,
            {cluster: string; path: string}
        >({
            queryFn: descriptionQuery,
            providesTags: [YTApiId.navigationGetAnnotationExternal],
        }),
        annotation: build.query<string, {cluster: string; path: string}>({
            queryFn: annotationQuery,
            providesTags: [YTApiId.navigationGetAnnotation],
        }),
    }),
});

export function udpateAnnotaionExternal(params: {
    cluster: string;
    path: string;
    value: string;
}): ThunkAction<Promise<void>, RootState, never, Action> {
    return (dispatch, getState) => {
        const {edit} = UIFactory.externalAnnotationSetup ?? {};
        if (edit) {
            const item = getExternalDescription(getState());
            const {value} = params;
            return wrapApiPromiseByToaster(edit(item, {newDescription: value}), {
                toasterName: 'updateAnnotationExternal',
                errorContent: 'Failed to update external description',
                skipSuccessToast: true,
            }).then(() => {
                dispatch(
                    descriptionApi.util.invalidateTags([YTApiId.navigationGetAnnotationExternal]),
                );
            });
        }
        return Promise.resolve();
    };
}

export function invalidateYTAnnotation(): ThunkAction<void, RootState, never, Action> {
    return (dispatch) => {
        dispatch(descriptionApi.util.invalidateTags([YTApiId.navigationGetAnnotation]));
    };
}

export const {useExternalDescriptionQuery, useAnnotationQuery} = descriptionApi;
