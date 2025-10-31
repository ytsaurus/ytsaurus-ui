import React from 'react';
import {isMaintenanceIgnored, setMaintenanceIgnored} from '../utils/maintenance';

const MaintenanceContext = React.createContext<{
    proceedToCluster?: boolean;
    setProceedToCluster(v: boolean): void;
}>({setProceedToCluster: () => {}});

export function useMaintenanceContext() {
    const value = React.useContext(MaintenanceContext);
    return value;
}

export function ClusterMaintenanceContext({
    children,
    cluster,
}: {
    cluster: string;
    children: React.ReactNode;
}) {
    const [proceedToCluster, setValue] = React.useState(isMaintenanceIgnored(cluster));

    React.useEffect(() => {
        setValue(() => {
            const newValue = isMaintenanceIgnored(cluster);
            return newValue;
        });
    }, [cluster]);

    const setProceedToCluster = React.useCallback(() => {
        setMaintenanceIgnored(cluster);
        setValue(true);
    }, [cluster]);

    return (
        <MaintenanceContext.Provider value={{proceedToCluster, setProceedToCluster}}>
            {children}
        </MaintenanceContext.Provider>
    );
}
