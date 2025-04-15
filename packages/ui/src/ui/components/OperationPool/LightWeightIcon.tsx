import React from 'react';
import {Icon} from '@gravity-ui/uikit';

import featherSvg from '../../assets/img/svg/feather.svg';
import {Tooltip} from '../../components/Tooltip/Tooltip';

export function LightWeightIcon({className}: {className?: string}) {
    return (
        <Tooltip className={className} content="Lightweight operations enabled">
            <Icon data={featherSvg} />
        </Tooltip>
    );
}
