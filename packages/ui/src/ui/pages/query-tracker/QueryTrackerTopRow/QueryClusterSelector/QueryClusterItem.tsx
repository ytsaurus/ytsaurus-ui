import React, {FC} from 'react';
import {ClusterConfig} from '../../../../../shared/yt-types';
import cn from 'bem-cn-lite';
import './QueryClusterItem.scss';
import {Text} from '@gravity-ui/uikit';
import ClusterIcon from '../../../../components/ClusterIcon/ClusterIcon';
import {useClusterColorClassName} from '../../../../containers/ClusterPageHeader/ClusterColor';

const block = cn('query-cluster-item');
const IconBlock = cn('query-cluster-icon');

type Props = Pick<ClusterConfig, 'id' | 'name' | 'environment'>;

export const QueryClusterItem: FC<Props> = ({id, name, environment}) => {
    const clusterColorClassName = useClusterColorClassName(id);

    return (
        <div className={block()}>
            <ClusterIcon name={name} className={IconBlock(null, clusterColorClassName)} />
            <div className={block('info')}>
                {name}
                <Text color="secondary" className={block('environment')}>
                    {environment}
                </Text>
            </div>
        </div>
    );
};
