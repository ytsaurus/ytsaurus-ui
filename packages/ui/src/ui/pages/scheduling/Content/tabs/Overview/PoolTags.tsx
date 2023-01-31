import React from 'react';
import {useSelector} from 'react-redux';
import cn from 'bem-cn-lite';
import _ from 'lodash';

import Label from '../../../../../components/Label/Label';
import UIFactory from '../../../../../UIFactory';
import {PoolInfo} from '../../../../../store/selectors/scheduling/scheduling-pools';
import {getCluster, getClusterUiConfig} from '../../../../../store/selectors/global';

import './PoolTags.scss';

const block = cn('scheduling-pool-tags');

function PoolTags({pool}: {pool: PoolInfo}) {
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
                    text={_.capitalize(integralType)}
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
