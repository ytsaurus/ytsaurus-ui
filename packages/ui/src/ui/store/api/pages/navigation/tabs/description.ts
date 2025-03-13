import {BaseQueryApi} from '@reduxjs/toolkit/query';
// @ts-ignore
import yt from '@ytsaurus/javascript-wrapper';

import UIFactory, {ExternalAnnotationResponse} from '../../../../../UIFactory';
import {TagTypes, ytApi} from '../../..';
import {wrapApiPromiseByToaster} from '../../../../../utils/utils';
import {RootState} from '../../../../../store/reducers';
import {getPath} from '../../../../../store/selectors/navigation';

const descriptionQuery = async (args: {cluster: string; path: string}) => {
    const {cluster, path} = args;
    try {
        const data = await UIFactory.externalAnnotationSetup.load(cluster, path);
        return {data};
    } catch (error) {
        return {error};
    }
};

const saveAnnotationMutation = async (args: {annotation: string}, {getState}: BaseQueryApi) => {
    const state = getState() as RootState;
    const path = getPath(state);
    try {
        wrapApiPromiseByToaster(yt.v3.set({path: `${path}/@annotation`}, args.annotation), {
            toasterName: 'navigation_save_annotation',
            successTitle: 'Annotation saved',
            errorTitle: 'Failed save annotation',
        });
        return {data: undefined};
    } catch (error) {
        return {error};
    }
};

export const descriptionApi = ytApi.injectEndpoints({
    endpoints: (build) => ({
        getExternalDescription: build.query<
            ExternalAnnotationResponse,
            {cluster: string; path: string}
        >({
            queryFn: descriptionQuery,
        }),
        setAnnotation: build.mutation<void, {annotation: string}>({
            queryFn: saveAnnotationMutation,
            invalidatesTags: [{type: TagTypes.NAVIGATION, id: 'description'}],
        }),
    }),
});

export const {useGetExternalDescriptionQuery} = descriptionApi;
