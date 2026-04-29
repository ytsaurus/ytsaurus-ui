import React from 'react';
import cn from 'bem-cn-lite';

import Label from '../../../../../../components/Label';
import {type PoolLeafNode, type PoolTreeNode} from '../../../../../../utils/scheduling/pool-child';

import './PoolTags.scss';

const block = cn('scheduling-pool-tags');

const INTEGRAL_TYPE_LABELS: Record<string, string> = {
    burst: 'Burst',
    relaxed: 'Relaxed',
};

function PoolTags({pool}: {pool: PoolTreeNode | PoolLeafNode}) {
    const {integralType} = pool;

    if (integralType === 'burst' || integralType === 'relaxed') {
        return (
            <Label
                key={'guarantee-type'}
                className={block('tag')}
                text={INTEGRAL_TYPE_LABELS[integralType]}
                theme={'complementary'}
            />
        );
    }

    return null;
}

export default React.memo(PoolTags);
