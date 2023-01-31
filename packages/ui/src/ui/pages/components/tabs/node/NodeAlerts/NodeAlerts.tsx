import React from 'react';
import _ from 'lodash';

import {getNodeAlerts} from '../../../../../store/selectors/components/node/node';
import {useSelector} from 'react-redux';
import Alert from '../../../../../components/Alert/Alert';

function NodeAlerts() {
    const alerts = useSelector(getNodeAlerts);
    return (
        <div>
            {_.map(alerts, (item, index) => (
                <Alert error={item} key={index} />
            ))}
        </div>
    );
}

export default React.memo(NodeAlerts);
