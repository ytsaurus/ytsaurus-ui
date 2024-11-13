import React from 'react';
import {useSelector} from 'react-redux';

import {getCluster} from '../../store/selectors/global';
import {getPath, getType} from '../../store/selectors/navigation';
import {getNavigationPathAttributes} from '../../store/selectors/navigation/navigation';
import UIFactory from '../../UIFactory';

function NavigationExtraActions({className}: {className?: string}) {
    const cluster = useSelector(getCluster);
    const path = useSelector(getPath);
    const type = useSelector(getType);
    const attributes = useSelector(getNavigationPathAttributes);

    return (
        <>
            {UIFactory.renderNavigationExtraActions({
                className,
                path,
                cluster,
                type: type ?? '', // todo What should be here by default? Maybe should throw an error?
                attributes,
            })}
        </>
    );
}

export default React.memo(NavigationExtraActions);
