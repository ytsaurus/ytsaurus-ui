import React from 'react';
import {useSelector} from 'react-redux';

import UIFactory from '../../../UIFactory';
import {getCluster} from '../../../store/selectors/global';
import {getChytCurrrentClique} from '../../../store/selectors/chyt';
import {NoContent} from '../../../components/NoContent/NoContent';

export function ChytPageCliqueMonitoring() {
    const cluster = useSelector(getCluster);
    const alias = useSelector(getChytCurrrentClique);

    const {component: MonitoginComponnet} = UIFactory.getMonitoringComponentForChyt() ?? {};
    if (!MonitoginComponnet) {
        return <NoContent />;
    }

    return <MonitoginComponnet cluster={cluster} alias={alias} />;
}
