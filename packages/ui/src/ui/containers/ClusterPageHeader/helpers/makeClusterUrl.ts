import {makeRoutedURL} from '../../../store/location';

export const makeClusterUrl = (cluster: string): string | null => {
    const oldUrl = makeRoutedURL(window.location.pathname);
    const [empty, oldCluster, ...rest] = oldUrl.split('/');
    if (oldCluster === cluster) {
        return null;
    }

    return [empty, cluster, ...rest].join('/');
};
