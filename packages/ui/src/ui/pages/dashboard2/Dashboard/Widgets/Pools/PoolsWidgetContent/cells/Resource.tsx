import React from 'react';
import b from 'bem-cn-lite';
import {Flex, Progress, Text} from '@gravity-ui/uikit';

import {Tooltip} from '../../../../../../../components/Tooltip/Tooltip';

import hammer from '../../../../../../../common/hammer';

import {PoolResource} from '../PoolsWidgetContent';

import './Resource.scss';

const block = b('pool-resource');

type Props = PoolResource & {
    type: Omit<keyof PoolResource, 'name'>;
};

export function ResourceCell(props: Props) {
    const {value, usage, garantee, type} = props;

    const theme = value <= 50 ? 'info' : value > 100 ? 'danger' : 'warning';

    return (
        <Tooltip
            className={block()}
            content={
                <Flex direction={'column'} gap={2}>
                    <Text>
                        Usage: {type === 'memory' ? hammer.format['Bytes'](usage) : usage || '-'}
                    </Text>
                    <Text>
                        Garantee:{' '}
                        {type === 'memory' ? hammer.format['Bytes'](garantee) : garantee || '-'}
                    </Text>
                </Flex>
            }
        >
            <Progress value={value} theme={theme} />
            {type !== 'operations' && <div className={block('tick')} />}
        </Tooltip>
    );
}
