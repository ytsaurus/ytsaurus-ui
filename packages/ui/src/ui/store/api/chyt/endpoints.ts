import {StrawberryApiType, chytApiAction} from '../../../utils/strawberryControllerApi';

export function chytFetch(args: Parameters<StrawberryApiType>) {
    try {
        const data = chytApiAction(...args);
        return {data};
    } catch (error) {
        return {error};
    }
}
