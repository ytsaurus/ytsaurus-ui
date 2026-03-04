import {Action, ThunkAction} from '@reduxjs/toolkit';
import {rootApi} from '../../../../store/api';
import {YTApiId, ytApiV3Id} from '../../../../rum/rum-wrap-api';
import type {RootState} from '../../../../store/reducers';
import {selectExternalDescription} from '../../../../store/selectors/navigation/description';
import UIFactory, {ExternalAnnotationResponse} from '../../../../UIFactory';
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

export interface GetAnnotationResponse {
    annotation?: string;
    annotation_path?: string;
}

const annotationQuery = async (args: {cluster: string; path: string}) => {
    const {path} = args;
    try {
        const response = await ytApiV3Id.executeBatch<GetAnnotationResponse>(
            YTApiId.navigationGetAnnotationExternal,
            {
                parameters: {
                    requests: [
                        {
                            command: 'get' as const,
                            parameters: {
                                path: path + '/@',
                                attributes: ['annotation', 'annotation_path'],
                            },
                        },
                    ],
                },
            },
        );

        const data = response?.[0]?.output ?? {};

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
        annotation: build.query<GetAnnotationResponse, {cluster: string; path: string}>({
            queryFn: annotationQuery,
            providesTags: [YTApiId.navigationGetAnnotation],
        }),
    }),
});

export function udpateAnnotationExternal(params: {
    cluster: string;
    path: string;
    value: string;
}): ThunkAction<Promise<void>, RootState, never, Action> {
    return (dispatch, getState) => {
        const {edit} = UIFactory.externalAnnotationSetup ?? {};
        if (edit) {
            const item = selectExternalDescription(getState());
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
