import {Page} from '../../constants/index';

export function genNavigationUrl(cluster: string, path: string) {
    return `/${cluster}/${Page.NAVIGATION}?path=${path}`;
}
