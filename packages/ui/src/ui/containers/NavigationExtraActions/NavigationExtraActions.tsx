import React from 'react';
import {useSelector} from '../../store/redux-hooks';

import {selectCluster} from '../../store/selectors/global';
import {selectPath, selectType} from '../../store/selectors/navigation';
import {selectNavigationPathAttributes} from '../../store/selectors/navigation/navigation';
import UIFactory from '../../UIFactory';

function NavigationExtraActions({className}: {className?: string}) {
    const cluster = useSelector(selectCluster);
    const path = useSelector(selectPath);
    const type = useSelector(selectType);
    const attributes = useSelector(selectNavigationPathAttributes);

    return (
        <>
            {UIFactory.renderNavigationExtraActions({
                className,
                path,
                cluster,
                type,
                attributes,
            })}
        </>
    );
}

export default React.memo(NavigationExtraActions);
