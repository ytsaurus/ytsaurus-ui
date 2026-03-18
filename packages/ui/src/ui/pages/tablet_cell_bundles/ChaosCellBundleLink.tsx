import React from 'react';
import Link from '../../components/Link/Link';
import {useSelector} from '../../store/redux-hooks';
import {selectCluster} from '../../store/selectors/global';
import {tabletActiveChaosBundleLink} from '../../utils/components/tablet-cells';

interface Props {
    className?: string;
    chaosCellBundle?: string;
    cluster?: string;
    inline?: boolean;
}

export default function ChaosCellBundleLink(props: Props) {
    const {cluster: propsCluster, chaosCellBundle} = props;
    const currentCluster = useSelector(selectCluster);
    const cluster = propsCluster || currentCluster;

    return (
        <Link theme={'primary'} routed url={tabletActiveChaosBundleLink(cluster, chaosCellBundle)}>
            {chaosCellBundle}
        </Link>
    );
}
