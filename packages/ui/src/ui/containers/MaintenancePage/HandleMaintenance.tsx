import React from 'react';
import {useSelector} from '../../store/redux-hooks';

import {MaintenancePage} from '../../containers/MaintenancePage/MaintenancePage';
import {selectMaintenanceEvent} from '../../store/selectors/global/maintenance';
import {useMaintenanceContext} from '../../hooks/use-maintenance';

type Props = {
    cluster: string;
    children: React.ReactNode;
    emptyMaintenance?: boolean;
};

export function useMaintenanceEvent(cluster: string) {
    const maintenance = useSelector(selectMaintenanceEvent);

    if (!maintenance?.event || maintenance.cluster !== cluster) {
        return undefined;
    }

    return maintenance.event;
}

export function HandleMaintenance({cluster, children, emptyMaintenance}: Props) {
    const {proceedToCluster, setProceedToCluster} = useMaintenanceContext();
    const event = useMaintenanceEvent(cluster);

    if (proceedToCluster || !event) {
        return children;
    }

    return emptyMaintenance ? null : (
        <MaintenancePage
            cluster={cluster}
            maintenancePageEvent={event}
            onProceed={() => {
                setProceedToCluster(true);
            }}
        />
    );
}
