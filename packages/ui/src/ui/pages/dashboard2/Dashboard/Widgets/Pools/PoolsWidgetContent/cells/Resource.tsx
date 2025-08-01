import React from 'react';
import b from 'bem-cn-lite';
import {Flex, Progress, Text} from '@gravity-ui/uikit';

import {Tooltip} from '../../../../../../../components/Tooltip/Tooltip';

import format from '../../../../../../../common/hammer/format';

import type {PoolResource} from '../../types';

import './Resource.scss';

const block = b('pool-resource');

type Props = PoolResource & {
    type: Omit<keyof PoolResource, 'name'>;
};

export function ResourceCell(props: Props) {
    const {value, usage, guarantee, type} = props;

    const theme = value < 100 ? 'info' : 'warning';

    const usageText = (type === 'memory' ? format.Bytes(usage) : usage) || format.NO_VALUE;
    const guaranteeText =
        (type === 'memory' ? format.Bytes(guarantee) : guarantee) || format.NO_VALUE;

    return (
        <Tooltip
            className={block()}
            content={
                <Flex direction={'column'} gap={2}>
                    <Text>Usage: {usageText}</Text>
                    <Text>Guarantee: {guaranteeText}</Text>
                </Flex>
            }
        >
            <Progress text={`${usageText} / ${guaranteeText}`} value={value} theme={theme} />
            {/* {type !== 'operations' && <div className={block('tick')} />} */}
        </Tooltip>
    );
}
