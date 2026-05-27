import React, {type FC} from 'react';
import {useSelector} from '../../../store/redux-hooks';
import {selectMasterAlerts} from '../../../store/selectors/system/masters';
import {YTErrorBlock} from '../../../components/Block/Block';

export const SystemAlert: FC<{className?: string}> = ({className}) => {
    const alerts = useSelector(selectMasterAlerts);

    if (!alerts.length) return;

    return (
        <div className={className}>
            {alerts.map((alert, id) => (
                <YTErrorBlock key={alert.message + id} type="alert" error={alert} />
            ))}
        </div>
    );
};
