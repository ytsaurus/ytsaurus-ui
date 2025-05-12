import React from 'react';
import {Text} from '@gravity-ui/uikit';

import hammer from '../../../../../../../common/hammer';

type Props = {
    startTime?: string;
};

export function StartTime({startTime}: Props) {
    return (
        <Text color={'secondary'} whiteSpace={'nowrap'}>
            {hammer.format['DateTime'](startTime, {format: 'human'})}
        </Text>
    );
}
