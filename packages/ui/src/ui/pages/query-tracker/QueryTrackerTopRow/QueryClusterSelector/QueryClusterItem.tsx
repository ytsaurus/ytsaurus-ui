import React, {FC} from 'react';
import {ClusterConfig} from '../../../../../shared/yt-types';
import cn from 'bem-cn-lite';
import './QueryClusterItem.scss';
import {Text} from '@gravity-ui/uikit';
import ClusterIcon from '../../../../components/ClusterIcon/ClusterIcon';
import {useClusterColorClassName} from '../../../../containers/ClusterPageHeader/ClusterColor';

const block = cn('query-cluster-item');
const IconBlock = cn('query-cluster-icon');

export type Props = Pick<ClusterConfig, 'id' | 'name' | 'environment'> & {className?: string};

export const QueryClusterItem: FC<Props> = ({id, name, environment, className}) => {
    const clusterColorClassName = useClusterColorClassName(id);

    return (
        <div className={block(null, className)} data-qa={'query-cluster-item'}>
            <ClusterIcon name={name} className={IconBlock(null, clusterColorClassName)} />
            <div className={block('info')}>
                <span data-qa={'query-cluster-item-name'}>{name}</span>
                <Text color="secondary" className={block('environment')}>
                    {environment}
                </Text>
            </div>
        </div>
    );
};
