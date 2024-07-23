import React from 'react';
import cn from 'bem-cn-lite';
import TopRowContent from '../AppNavigation/TopRowContent/TopRowContent';
import './ClusterPageHeader.scss';
import {ClusterPicker} from './ClusterPicker';
import {HeadSpacer} from './HeadSpacer';
import {getClusterConfigByName} from '../../store/selectors/global';
import HandleMaintenance from '../../containers/MaintenancePage/HandleMaintenance';

const block = cn('cluster-page-header');

function ClusterPageHeader({cluster}: {cluster: string}) {
    const clusterConfig = getClusterConfigByName(cluster);

    return (
        <div className={block()}>
            <ClusterPicker cluster={cluster} clusterConfig={clusterConfig} />
            <HeadSpacer />
            <HandleMaintenance cluster={cluster} maintenanceContent={null}>
                <TopRowContent />
            </HandleMaintenance>
        </div>
    );
}

export default React.memo(ClusterPageHeader);
