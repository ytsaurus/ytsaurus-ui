import React from 'react';

import format from '../../../common/hammer/format';
import Label from '../../../components/Label';
import {
    type StrawberryCliqueHealthType,
    type StrawberryCliqueStateType,
} from '../../../utils/strawberryControllerApi';
import i18nChytValues from '../i18n-chyt-values';

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
        <Label
            text={i18nChytValues(`state-value_${state}`)}
            theme={THEME_MAP[state]}
            hideTitle
            capitalize
        />
    );
}
