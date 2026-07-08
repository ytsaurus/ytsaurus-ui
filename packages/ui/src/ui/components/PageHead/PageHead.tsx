import React from 'react';
import PropTypes from 'prop-types';
import {Helmet} from 'react-helmet';
import {useSelector} from '../../store/redux-hooks';
import {type RootState} from '../../store/reducers';
import {getClusterAppearance} from '../../appearance';

PageHead.propTypes = {
    title: PropTypes.string,
    cluster: PropTypes.string,
};

function PageHead({title, cluster}: {title: string; cluster?: string}) {
    const {favicon} = getClusterAppearance(cluster) || {};

    React.useLayoutEffect(() => {
        const links = document.head.querySelectorAll<HTMLLinkElement>('link[rel="icon"]');
        links.forEach((link) => link.parentNode?.removeChild(link));
    }, []);

    return (
        <Helmet>
            <link rel="icon" href={favicon} />
            <title>{title}</title>
        </Helmet>
    );
}

export default React.memo(PageHead);

function PageHeadByClusterImpl({cluster}: {cluster: string}) {
    const title = useSelector((state: RootState) => state.global.title);
    return <PageHead title={title} cluster={cluster} />;
}

export const PageHeadByCluster = React.memo(PageHeadByClusterImpl);
