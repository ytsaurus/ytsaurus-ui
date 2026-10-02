import {type CancelToken} from 'axios';

import {chytApiAction} from '../../../utils/strawberryControllerApi';
import {
    type CreationOptions,
    isCreationOptionsUnsupported,
    parseCreationOptions,
} from './creation-options';

export async function loadCreationOptions(
    cluster: string,
    isAdmin: boolean,
    cancelToken: CancelToken,
): Promise<CreationOptions> {
    try {
        const {result} = await chytApiAction(
            'describe_creation_options',
            cluster,
            {},
            {
                isAdmin,
                cancelToken,
                skipErrorToast: true,
            },
        );
        return {legacy: false, resources: parseCreationOptions(result)};
    } catch (error) {
        if (isCreationOptionsUnsupported(error)) return {legacy: true};
        throw error;
    }
}
