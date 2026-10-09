import {rootApi} from '../..';
import UIFactory from '../../../../UIFactory';
import type {ExternalSchemaDescription} from '../../../../pages/navigation/tabs/Schema/ExternalDescription/ExternalDescription';

export type ExternalSchemaData = {
    url?: string;
    entries?: Array<[string, ExternalSchemaDescription]>;
};

export const externalSchemaApi = rootApi.injectEndpoints({
    endpoints: (build) => ({
        externalSchema: build.query<ExternalSchemaData, {cluster: string; path: string}>({
            keepUnusedDataFor: 60,
            async queryFn({cluster, path}) {
                try {
                    const {url, externalSchema} =
                        await UIFactory.externalSchemaDescriptionSetup.load(cluster, path);
                    return {
                        data: {
                            url,
                            entries: externalSchema
                                ? Array.from(externalSchema.entries())
                                : undefined,
                        },
                    };
                } catch (error) {
                    return {error};
                }
            },
        }),
    }),
});

export const {useExternalSchemaQuery} = externalSchemaApi;
