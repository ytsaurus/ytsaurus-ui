import React from 'react';

import hammer from '../../common/hammer';

import Label, {LabelTheme} from '../../components/Label/Label';

import {YTHealth} from '../../types';

import {StrawberryCliqueHealthType} from '../../utils/strawberryControllerApi';

const HEALTH_TO_THEME: {[health: string]: LabelTheme} = {
    good: 'success',
    initializing: 'warning',
    degrading: 'warning',
    failed: 'danger',
    changing: 'info',
    pending: 'info',
};

export function Health(props: {value?: YTHealth | StrawberryCliqueHealthType; className?: string}) {
    const {value, className} = props;
    const theme: LabelTheme = HEALTH_TO_THEME[value || ''];
    return !value ? (
        hammer.format.NO_VALUE
    ) : (
        <Label className={className} theme={theme}>
            {value}
        </Label>
    );
}
