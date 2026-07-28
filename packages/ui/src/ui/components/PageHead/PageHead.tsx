import React, {useLayoutEffect} from 'react';
import {Helmet} from 'react-helmet';
import {useSelector} from '../../store/redux-hooks';
import {type RootState} from '../../store/reducers';
import {getClusterAppearance} from '../../appearance';

function PageHead({title, favicon}: {title: string; favicon?: string}) {
    /*
     * Removes stale <link rel="icon"> tags added by the HTML template.
     * Use useLayoutEffect (not useEffect) to remove the stale icon before react-helmet
     * commits the new one, so both never coexist in <head>.
     */
    useLayoutEffect(() => {
        if (!favicon) {
            return;
        }

        document.head
            .querySelectorAll<HTMLLinkElement>('link[rel="icon"]:not([data-react-helmet])')
            .forEach((link) => link.remove());
    }, [favicon]);

    return (
        <Helmet>
            <title>{title}</title>
            {favicon ? <link rel="icon" href={favicon} /> : null}
        </Helmet>
    );
}

export default React.memo(PageHead);

function PageHeadByClusterImpl({cluster}: {cluster: string}) {
    const title = useSelector((state: RootState) => state.global.title);
    const {favicon} = getClusterAppearance(cluster);

    return <PageHead title={title} favicon={favicon} />;
}

export const PageHeadByCluster = React.memo(PageHeadByClusterImpl);
