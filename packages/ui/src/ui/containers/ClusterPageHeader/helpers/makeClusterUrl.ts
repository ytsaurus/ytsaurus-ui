import {makeRoutedURL} from '../../../store/location';
import {matchPath} from 'react-router';

export const makeClusterUrl = (cluster: string): string | null => {
    const match = matchPath(window.location.pathname, {
        path: '/:cluster/:page',
    });
    if (!match) {
        return null;
    }

    const oldUrl = makeRoutedURL(window.location.pathname);
    const [empty, oldCluster, ...rest] = oldUrl.split('/');
    if (oldCluster === cluster) {
        return null;
    }

    return [empty, cluster, ...rest].join('/');
};
