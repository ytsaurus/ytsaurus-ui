import React from 'react';
import cn from 'bem-cn-lite';

import capitalize_ from 'lodash/capitalize';

import Label from '../../../../../../components/Label/Label';
import type {PoolLeafNode, PoolTreeNode} from '../../../../../../utils/scheduling/pool-child';
import {YTText} from '../../../../../../components/Text/Text';

import './PoolTags.scss';

const block = cn('scheduling-pool-tags');

function PoolTags({pool}: {pool: PoolTreeNode | PoolLeafNode}) {
    const {integralType} = pool;
    const showGuaranteeType = integralType === 'burst' || integralType === 'relaxed';
    const hasFlow = Number(pool.flowCPU) > 0 || Number(pool.flowGPU) > 0;

    const content = [
        showGuaranteeType && (
            <Label
                key={'guarantee-type'}
                className={block('tag')}
                text={capitalize_(integralType)}
                theme={'complementary'}
            />
        ),
        !showGuaranteeType && hasFlow && (
            <Label
                key="integral"
                className={block('tag')}
                text={'Integral'}
                theme={'complementary'}
            />
        ),
        pool.mode === 'fifo' && (
            <Label key="fifo" className={block('tag')} text={'FIFO'} theme={'misc'} />
        ),
    ].filter(Boolean);

    if (content.length === 0) {
        content.push(<YTText color="secondary">Fair share</YTText>);
    }

    return <span className={block()}>{content}</span>;
}

export default React.memo(PoolTags);
