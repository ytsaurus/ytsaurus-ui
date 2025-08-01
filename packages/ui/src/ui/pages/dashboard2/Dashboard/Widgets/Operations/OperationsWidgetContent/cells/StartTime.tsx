import React from 'react';
import {Flex, Text} from '@gravity-ui/uikit';
import format from '../../../../../../../common/hammer/format';

type Props = {
    startTime?: string;
};

export function StartTime({startTime}: Props) {
    return (
        <Flex direction={'column'}>
            <Text whiteSpace={'nowrap'}>
                {format.DateTime(startTime, {
                    format: 'human',
                })}
            </Text>
            <Text style={{color: 'var(--secondary-text)'}} whiteSpace={'nowrap'}>
                {format.DateTime(startTime)}
            </Text>
        </Flex>
    );
}
