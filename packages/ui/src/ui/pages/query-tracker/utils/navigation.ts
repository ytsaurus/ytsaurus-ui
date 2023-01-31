import {makeRoutedURL} from '../../../store/location';
import {Page} from '../../../../shared/constants/settings';
import {QueryEngine} from '../module/api';

export function createQueryUrl(cluster: string, query_id: string) {
    return `/${cluster}/${Page.QUERIES}/${query_id}`;
}

export function createNewQueryUrl(cluster: string, engine: QueryEngine, query = '') {
    return makeRoutedURL(`/${cluster}/${Page.QUERIES}?engine=${engine}&query=${query}`);
}
