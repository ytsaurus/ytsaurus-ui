import React from 'react';
import cn from 'bem-cn-lite';

import capitalize_ from 'lodash/capitalize';

import format from '../../../common/hammer/format';
import ypath from '../../../common/thor/ypath';

import MetaTable from '../../../components/MetaTable/MetaTable';
import {useSelector} from 'react-redux';
import {getCurrentPool, getIsRoot} from '../../../store/selectors/scheduling/scheduling';
import UIFactory from '../../../UIFactory';
import {getClusterUiConfig} from '../../../store/selectors/global';

const block = cn('pool-meta-table');

interface Props {
    className?: string;
}

export default function PoolMetaData({className}: Props) {
    const pool = useSelector(getCurrentPool);
    const isRoot = useSelector(getIsRoot);
    const clusterUiConfig = useSelector(getClusterUiConfig);

    if (!pool || isRoot) {
        return null;
    }

    const cpu = ypath.getNumber(pool, '/cypressAttributes/strong_guarantee_resources/cpu', 0);
    const gpu = ypath.getNumber(pool, '/cypressAttributes/strong_guarantee_resources/gpu', 0);
    const memory = ypath.getNumber(pool, '/cypressAttributes/strong_guarantee_resources/memory', 0);
    const hasStrong = cpu > 0 || gpu > 0 || memory > 0;

    const {integralType, mode} = pool;
    const hasIntegralType = integralType && integralType !== 'none';

    const guaranteeType = [hasStrong && 'Strong', hasIntegralType && capitalize_(integralType)]
        .filter(Boolean)
        .join(' + ');
    return (
        <div className={block(null, className)}>
            <MetaTable
                items={[
                    {
                        key: 'Guarantee type',
                        value: guaranteeType || 'Strong',
                    },
                    {
                        key: 'Mode',
                        value: format.Readable(mode) || format.NO_VALUE,
                    },
                    ...(UIFactory.getExtraMetaTableItemsForPool({pool, clusterUiConfig}) || []),
                ]}
            />
        </div>
    );
}
