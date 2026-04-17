import React from 'react';

import map_ from 'lodash/map';

import cn from 'bem-cn-lite';

import {selectNodeAlerts} from '../../../../../store/selectors/components/node/node';
import {useSelector} from '../../../../../store/redux-hooks';
import {YTAlertBlock} from '../../../../../components/Alert/Alert';

import './NodeAlerts.scss';

const block = cn('yt-node-alerts');

function NodeAlerts() {
    const alerts = useSelector(selectNodeAlerts);
    return (
        <div>
            {map_(alerts, (item, index) => (
                <YTAlertBlock className={block('item')} error={item} key={index} />
            ))}
        </div>
    );
}

export default React.memo(NodeAlerts);
