import React from 'react';

import i18n from './i18n';
import {type MasterInstanceState} from '../../../../store/selectors/system/masters';

type InstanceStateProps = {
    state?: MasterInstanceState;
};

export function InstanceState({state = 'unknown'}: InstanceStateProps) {
    return <span>{i18n(`value_${state}`)}</span>;
}
