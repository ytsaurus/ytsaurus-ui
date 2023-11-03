import React from 'react';
import {useSelector} from 'react-redux';

import UIFactory from '../../../UIFactory';
import {getCluster} from '../../../store/selectors/global';
import {getChytCurrentAlias} from '../../../store/selectors/chyt';
import {NoContent} from '../../../components/NoContent/NoContent';

export function ChytPageCliqueMonitoring() {
    const cluster = useSelector(getCluster);
    const alias = useSelector(getChytCurrentAlias);

    const {component: MonitoginComponnet} = UIFactory.getMonitoringComponentForChyt() ?? {};
    if (!MonitoginComponnet) {
        return <NoContent />;
    }

    return <MonitoginComponnet cluster={cluster} alias={alias} />;
}
