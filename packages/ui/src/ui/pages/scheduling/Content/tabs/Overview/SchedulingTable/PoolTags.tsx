import React from 'react';
import cn from 'bem-cn-lite';

import capitalize_ from 'lodash/capitalize';

import Label from '../../../../../../components/Label/Label';
import type {PoolLeafNode, PoolTreeNode} from '../../../../../../utils/scheduling/pool-child';

import './PoolTags.scss';

const block = cn('scheduling-pool-tags');

function PoolTags({pool}: {pool: PoolTreeNode | PoolLeafNode}) {
    const {integralType, flowCPU, flowGPU} = pool;

    if (integralType === 'burst' || integralType === 'relaxed') {
        return (
            <Label
                key={'guarantee-type'}
                className={block('tag')}
                text={capitalize_(integralType)}
                theme={'complementary'}
            />
        );
    }

    if (Number(flowCPU) > 0 || Number(flowGPU) > 0) {
        return (
            <Label
                key="integral"
                className={block('tag')}
                text={'Integral'}
                theme={'complementary'}
            />
        );
    }

    return null;
}

export default React.memo(PoolTags);
