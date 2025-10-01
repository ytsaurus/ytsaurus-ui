import React from 'react';
import {useSelector} from '../../../../../store/redux-hooks';
import cn from 'bem-cn-lite';

import capitalize_ from 'lodash/capitalize';

import Label from '../../../../../components/Label/Label';
import UIFactory from '../../../../../UIFactory';
import {getCluster, getClusterUiConfig} from '../../../../../store/selectors/global';
import {PoolTreeNode} from '../../../../../utils/scheduling/pool-child';

import './PoolTags.scss';

const block = cn('scheduling-pool-tags');

function PoolTags({pool}: {pool: PoolTreeNode}) {
    const cluster = useSelector(getCluster);
    const clusterUiConfig = useSelector(getClusterUiConfig);

    const {integralType} = pool;
    const showGuaranteeType = integralType === 'burst' || integralType === 'relaxed';
    const hasFlow = Number(pool.flowCPU) > 0 || Number(pool.flowGPU) > 0;
    return (
        <span className={block()}>
            {showGuaranteeType && (
                <Label
                    className={block('tag')}
                    text={capitalize_(integralType)}
                    theme={'complementary'}
                />
            )}
            {!showGuaranteeType && hasFlow && (
                <Label className={block('tag')} text={'Integral'} theme={'complementary'} />
            )}
            {pool.mode === 'fifo' && (
                <Label className={block('tag')} text={'FIFO'} theme={'misc'} />
            )}
            {UIFactory.renderSchedulingTableItemExtraControls({
                cluster,
                pool,
                clusterUiConfig,
            })}
        </span>
    );
}

export default React.memo(PoolTags);
