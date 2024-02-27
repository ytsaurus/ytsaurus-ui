import React, {FC} from 'react';
import {useSelector} from 'react-redux';
import {selectMasterAlerts} from '../../../store/selectors/system/masters';
import Alert from '../../../components/Alert/Alert';

export const SystemAlert: FC<{className?: string}> = ({className}) => {
    const alerts = useSelector(selectMasterAlerts);

    if (!alerts.length) return;

    return (
        <div className={className}>
            {alerts.map((alert, id) => (
                <Alert key={alert.message + id} error={alert} />
            ))}
        </div>
    );
};
