import React from 'react';
import _ from 'lodash';
import cn from 'bem-cn-lite';

import {getNodeAlerts} from '../../../../../store/selectors/components/node/node';
import {useSelector} from 'react-redux';
import Alert from '../../../../../components/Alert/Alert';

import './NodeAlerts.scss';

const block = cn('yt-node-alerts');

function NodeAlerts() {
    const alerts = useSelector(getNodeAlerts);
    return (
        <div>
            {_.map(alerts, (item, index) => (
                <Alert className={block('item')} error={item} key={index} />
            ))}
        </div>
    );
}

export default React.memo(NodeAlerts);
