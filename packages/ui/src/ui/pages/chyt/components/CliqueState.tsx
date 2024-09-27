import React from 'react';

import format from '../../../common/hammer/format';
import Label from '../../../components/Label/Label';
import {
    StrawberryCliqueHealthType,
    StrawberryCliqueStateType,
} from '../../../utils/strawberryControllerApi';

const THEME_MAP: Partial<
    Record<
        StrawberryCliqueStateType | StrawberryCliqueHealthType,
        'danger' | 'success' | 'info' | 'warning'
    >
> = {
    good: 'success',
    failed: 'danger',
    active: 'success',
    pending: 'info',
    untracked: 'warning',
};

export function CliqueState({
    state,
}: {
    state?: StrawberryCliqueStateType | StrawberryCliqueHealthType;
}) {
    return !state ? (
        format.NO_VALUE
    ) : (
        <Label text={state} theme={THEME_MAP[state]} hideTitle capitalize />
    );
}
