import React from 'react';
import cn from 'bem-cn-lite';

import capitalize_ from 'lodash/capitalize';

import Label from '../../../../../../components/Label/Label';
import type {PoolLeafNode, PoolTreeNode} from '../../../../../../utils/scheduling/pool-child';

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
    ].filter(Boolean);

    return content;
}

export default React.memo(PoolTags);
