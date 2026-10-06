import {type CancelToken} from 'axios';

import {chytApiAction} from '../../../utils/strawberryControllerApi';
import {type CreationOptions, parseCreationOptions} from './creation-options';

export async function loadCreationOptions(
    cluster: string,
    isAdmin: boolean,
    cancelToken: CancelToken,
): Promise<CreationOptions> {
    const requestOptions = {isAdmin, cancelToken, skipErrorToast: true};
    const {commands} = await chytApiAction('describe', cluster, {}, requestOptions);
    if (!commands.some(({name}) => name === 'describe_default_options')) {
        return {};
    }
    const {result} = await chytApiAction('describe_default_options', cluster, {}, requestOptions);
    return {resources: parseCreationOptions(result)};
}
