import React from 'react';
import {type NavigationCluster} from '@gravity-ui/querieskit';
import {Avatar} from '@gravity-ui/uikit';

import {useClusterColorClassName} from '../../../../../containers/ClusterPageHeader/ClusterColor';

type Props = Pick<NavigationCluster, 'id' | 'title'>;

export function NavigationClusterAvatar({id, title}: Props) {
    const className = useClusterColorClassName(id);

    return (
        <Avatar
            className={className}
            text={title}
            shape="square"
            size="2xs"
            backgroundColor="var(--cluster-color)"
            color="#ffffff"
        />
    );
}
