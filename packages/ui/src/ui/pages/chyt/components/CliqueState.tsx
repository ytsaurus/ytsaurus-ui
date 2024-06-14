import React from 'react';

import format from '../../../common/hammer/format';
import Label from '../../../components/Label/Label';
import {ChytCliqueHealthType, ChytCliqueStateType} from '../../../utils/strawberryControllerApi';

const THEME_MAP: Partial<
    Record<ChytCliqueStateType | ChytCliqueHealthType, 'danger' | 'success' | 'info' | 'warning'>
> = {
    good: 'success',
    failed: 'danger',
    active: 'success',
    pending: 'info',
    untracked: 'warning',
};

export function CliqueState({state}: {state?: ChytCliqueStateType | ChytCliqueHealthType}) {
    return !state ? (
        format.NO_VALUE
    ) : (
        <Label text={state} theme={THEME_MAP[state]} hideTitle capitalize />
    );
}
