import React from 'react';
import {Flex, Text} from '@gravity-ui/uikit';
import hammer from '../../../../../../../common/hammer';

type Props = {
    startTime?: string;
};

export function StartTime({startTime}: Props) {
    return (
        <Flex direction={'column'}>
            <Text whiteSpace={'nowrap'}>
                {hammer.format['DateTime'](startTime, {
                    format: 'human',
                })}
            </Text>
            <Text style={{color: 'var(--secondary-text)'}} whiteSpace={'nowrap'}>
                {hammer.format['DateTime'](startTime)}
            </Text>
        </Flex>
    );
}
