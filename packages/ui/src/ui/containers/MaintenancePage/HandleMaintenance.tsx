import React from 'react';
import {ConnectedProps, connect} from 'react-redux';

import {MaintenancePage} from '../../containers/MaintenancePage/MaintenancePage';
import {RootState} from '../../store/reducers';
import {isMaintenanceIgnored, setMaintenanceIgnored} from '../../utils/maintenance';

type Props = {
    cluster: string;
    children: React.ReactNode;
    maintenanceContent?: React.ReactNode;
};

type ReduxProps = ConnectedProps<typeof connector>;

class HandleMaintenance extends React.Component<Props & ReduxProps> {
    render() {
        const {cluster, maintenancePageEvent, maintenanceContent, children} = this.props;

        if (maintenancePageEvent) {
            const isIgnored = isMaintenanceIgnored(cluster);

            if (!isIgnored) {
                return maintenanceContent !== undefined ? (
                    maintenanceContent
                ) : (
                    <MaintenancePage
                        cluster={cluster}
                        maintenancePageEvent={maintenancePageEvent}
                        onProceed={() => {
                            setMaintenanceIgnored(cluster);
                            this.forceUpdate();
                        }}
                    />
                );
            }
        }

        return children;
    }
}

const mapStateToProps = (state: RootState) => {
    const {maintenancePageEvent, eventsFirstUpdate} = state.global;

    return {maintenancePageEvent, eventsFirstUpdate};
};

const connector = connect(mapStateToProps);

export default connector(HandleMaintenance);
