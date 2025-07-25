import {Action, ThunkAction} from '@reduxjs/toolkit';
import {rootApi} from '../..';

import {RootState} from '../../../../store/reducers';

import {YTApiId, ytApiV3} from '../../../../rum/rum-wrap-api';
import UIFactory, {ExternalAnnotationResponse} from '../../../../UIFactory';
import {prepareRequest} from '../../../../utils/navigation';

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
        }),
        annotation: build.query<string, {cluster: string; path: string}>({
            queryFn: annotationQuery,
            providesTags: [YTApiId.navigationGetAnnotation],
        }),
    }),
});

export function invalidateYTAnnotation(): ThunkAction<void, RootState, never, Action> {
    return (dispatch) => {
        dispatch(descriptionApi.util.invalidateTags([YTApiId.navigationGetAnnotation]));
    };
}

export const {useExternalDescriptionQuery, useAnnotationQuery} = descriptionApi;
