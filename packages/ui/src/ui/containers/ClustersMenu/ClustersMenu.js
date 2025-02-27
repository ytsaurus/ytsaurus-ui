import React, {Fragment} from 'react';
import {useSelector} from 'react-redux';

import PageHead from '../../components/PageHead/PageHead';

import ClustersMenuHeader from './ClustersMenuHeader';
import ClustersMenuBody from './ClustersMenuBody';

function ClustersMenu() {
    const title = useSelector((state) => state.global.title);

    return (
        <Fragment>
            <PageHead title={title} />
            <ClustersMenuHeader />
            <ClustersMenuBody />
        </Fragment>
    );
}

export default React.memo(ClustersMenu);
