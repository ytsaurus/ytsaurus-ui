import React from 'react';
import {useSelector} from 'react-redux';

import {MaintenancePage} from '../../containers/MaintenancePage/MaintenancePage';
import {isMaintenanceIgnored, setMaintenanceIgnored} from '../../utils/maintenance';
import {getMaintenanceEvent} from '../../store/selectors/global/maintenance';

type Props = {
    cluster: string;
    children: React.ReactNode;
    emptyMaintenance?: boolean;
};

export function HandleMaintenance({cluster, children, emptyMaintenance}: Props) {
    const [c, forceUpdate] = React.useState(0);

    const maintenancePageEvent = useSelector(getMaintenanceEvent);

    if (maintenancePageEvent) {
        const isIgnored = isMaintenanceIgnored(cluster);

        if (!isIgnored) {
            return emptyMaintenance ? null : (
                <MaintenancePage
                    cluster={cluster}
                    maintenancePageEvent={maintenancePageEvent}
                    onProceed={() => {
                        setMaintenanceIgnored(cluster);
                        forceUpdate(c + 1);
                    }}
                />
            );
        }
    }

    return children;
}
