import React from 'react';
import {Text} from '@gravity-ui/uikit';

import format from '../../../../../../../common/hammer/format';

type Props = {
    startTime?: string;
};

export function StartTime({startTime}: Props) {
    return (
        <Text color={'secondary'} whiteSpace={'nowrap'}>
            {format.DateTime(startTime, {format: 'human'})}
        </Text>
    );
}
