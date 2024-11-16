import React from 'react';
import {useSelector} from 'react-redux';

import {getPath} from '../../../../../store/selectors/navigation';
import {getCluster} from '../../../../../store/selectors/global';
import {OpenQueryButtons} from '../../../../../containers/OpenQueryButtons/OpenQueryButtons';

export function CreateQueryFromTable({className}: {className: string}) {
    const cluster = useSelector(getCluster);
    const path = useSelector(getPath);

    return <OpenQueryButtons className={className} path={path} cluster={cluster} />;
}
