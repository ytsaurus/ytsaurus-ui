import React from 'react';
import {useSelector} from '../../store/redux-hooks';

import {MaintenancePage} from '../../containers/MaintenancePage/MaintenancePage';
import {getMaintenanceEvent} from '../../store/selectors/global/maintenance';
import {useMaintenanceContext} from '../../hooks/use-maintenance';

type Props = {
    cluster: string;
    children: React.ReactNode;
    emptyMaintenance?: boolean;
};

export function HandleMaintenance({cluster, children, emptyMaintenance}: Props) {
    const {proceedToCluster, setProceedToCluster} = useMaintenanceContext();
    const maintenancePageEvent = useSelector(getMaintenanceEvent);

    if (!maintenancePageEvent || proceedToCluster) {
        return children;
    }

    return emptyMaintenance ? null : (
        <MaintenancePage
            cluster={cluster}
            maintenancePageEvent={maintenancePageEvent}
            onProceed={() => {
                setProceedToCluster(true);
            }}
        />
    );
}
