import React from 'react';
import {useSelector} from '../../../store/redux-hooks';

import UIFactory from '../../../UIFactory';
import {selectCluster} from '../../../store/selectors/global';
import {getChytCurrentAlias} from '../../../store/selectors/chyt';
import {NoContent} from '../../../components/NoContent';

export function ChytPageCliqueMonitoring() {
    const cluster = useSelector(selectCluster);
    const alias = useSelector(getChytCurrentAlias);

    const {component: MonitoginComponnet} = UIFactory.getMonitoringComponentForChyt() ?? {};
    if (!MonitoginComponnet) {
        return <NoContent />;
    }

    return <MonitoginComponnet cluster={cluster} alias={alias} />;
}
