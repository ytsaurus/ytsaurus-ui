import React from 'react';

import map_ from 'lodash/map';

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
            {map_(alerts, (item, index) => (
                <Alert className={block('item')} error={item} key={index} />
            ))}
        </div>
    );
}

export default React.memo(NodeAlerts);
