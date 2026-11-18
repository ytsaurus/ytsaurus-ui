import {useCallback} from 'react';

import {useDispatch, useSelector} from '../../../store/redux-hooks';
import {selectNavigationClusterConfig} from '../../../store/selectors/query-tracker/queryNavigation';
import {navigationToggleFavourite} from '../../../store/actions/favourites';
import {copyPathToClipboard} from '../../../store/actions/query-tracker/queryNavigation';
import {getNavigationUrl} from './helpers/getNavigationUrl';

export function useNavigationNodeActions() {
    const dispatch = useDispatch();
    const clusterConfig = useSelector(selectNavigationClusterConfig);
    const cluster = clusterConfig?.id;

    const handleFavoriteToggle = useCallback(
        (path: string) => {
            if (!cluster) return;
            dispatch(navigationToggleFavourite(path, cluster));
        },
        [cluster, dispatch],
    );

    const handleClipboardCopy = useCallback(
        (path: string) => {
            if (!cluster) return;
            dispatch(copyPathToClipboard(getNavigationUrl(cluster, path)));
        },
        [cluster, dispatch],
    );

    const handleNewWindowOpen = useCallback(
        (path: string) => {
            if (!cluster) return;
            const url = new URL(location.origin + `/${cluster}/navigation`);
            url.searchParams.append('path', path);
            window.open(url);
        },
        [cluster],
    );

    return {handleFavoriteToggle, handleClipboardCopy, handleNewWindowOpen};
}
