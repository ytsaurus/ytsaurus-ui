import React, {FC} from 'react';
import cn from 'bem-cn-lite';
import TopRowContent from '../AppNavigation/TopRowContent/TopRowContent';
import {useSelector} from 'react-redux';
import './ClusterPageHeader.scss';
import {getCluster, getCurrentClusterConfig} from '../../store/selectors/global';
import {ClusterPicker} from './ClusterPicker';
import {HeadSpacer} from './HeadSpacer';

const block = cn('cluster-page-header');

const ClusterPageHeader: FC = () => {
    const cluster = useSelector(getCluster);
    const clusterConfig = useSelector(getCurrentClusterConfig);

    return (
        <div className={block()}>
            <ClusterPicker cluster={cluster} clusterConfig={clusterConfig} />
            <HeadSpacer />
            <TopRowContent />
        </div>
    );
};

export default React.memo(ClusterPageHeader);
