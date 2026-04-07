import React from 'react';
import {Icon} from '@gravity-ui/uikit';

import featherSvg from '../../assets/img/svg/feather.svg';
import {Tooltip} from '@ytsaurus/components';

import i18n from './i18n';

export function LightWeightIcon({className}: {className?: string}) {
    return (
        <Tooltip className={className} content={i18n('context_lightweight-operations-enabled')}>
            <Icon data={featherSvg} />
        </Tooltip>
    );
}
