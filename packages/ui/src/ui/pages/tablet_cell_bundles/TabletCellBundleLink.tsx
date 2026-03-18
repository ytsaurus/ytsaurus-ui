import React from 'react';
import Link from '../../components/Link/Link';
import {useSelector} from '../../store/redux-hooks';
import {selectCluster} from '../../store/selectors/global';
import {tabletActiveBundleLink} from '../../utils/components/tablet-cells';

interface Props {
    className?: string;
    tabletCellBundle?: string;
    cluster?: string;
    inline?: boolean;
}

export default function TabletCellBundleLink(props: Props) {
    const {cluster: propsCluster, tabletCellBundle} = props;
    const currentCluster = useSelector(selectCluster);
    const cluster = propsCluster || currentCluster;

    return (
        <Link theme={'primary'} routed url={tabletActiveBundleLink(cluster, tabletCellBundle)}>
            {tabletCellBundle}
        </Link>
    );
}
