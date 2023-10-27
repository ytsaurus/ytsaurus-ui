import React from 'react';

import format from '../../../common/hammer/format';
import Label from '../../../components/Label/Label';
import {ChytCliqueStateType} from '../../../store/actions/chyt/api';

const THEME_MAP: Partial<Record<ChytCliqueStateType, 'danger' | 'success'>> = {
    active: 'success',
    broken: 'danger',
};

export function CliqueState({state}: {state?: ChytCliqueStateType}) {
    return !state ? format.NO_VALUE : <Label text={state} theme={THEME_MAP[state]} capitalize />;
}
