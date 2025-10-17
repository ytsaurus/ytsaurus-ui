import React from 'react';
import PropTypes from 'prop-types';
import {Helmet} from 'react-helmet';
import {useSelector} from '../../store/redux-hooks';
import {RootState} from '../../store/reducers';
import {getClusterAppearance} from '../../appearance';

PageHead.propTypes = {
    title: PropTypes.string,
    cluster: PropTypes.string,
};

function PageHead({title, cluster}: {title: string; cluster?: string}) {
    const {favicon} = getClusterAppearance(cluster) || {};

    return (
        <Helmet key="helmet">
            <link rel="shortcut icon" href={favicon} />
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
