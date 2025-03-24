import UIFactory, {ExternalAnnotationResponse} from '../../../../../UIFactory';
import {rootApi} from '../../..';

const descriptionQuery = async (args: {cluster: string; path: string}) => {
    const {cluster, path} = args;
    try {
        const data = await UIFactory.externalAnnotationSetup?.load(cluster, path);
        return {data};
    } catch (error) {
        return {error};
    }
};

export const descriptionApi = rootApi.injectEndpoints({
    endpoints: (build) => ({
        getExternalDescription: build.query<
            ExternalAnnotationResponse,
            {cluster: string; path: string}
        >({
            queryFn: descriptionQuery,
        }),
    }),
});

export const {useGetExternalDescriptionQuery} = descriptionApi;
