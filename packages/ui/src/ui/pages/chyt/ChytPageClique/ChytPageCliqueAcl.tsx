import React from 'react';
import {useSelector} from '../../../store/redux-hooks';

import {getChytCurrentAlias} from '../../../store/selectors/chyt';
import {AccessContentAcl} from '../../../containers/ACL';

export function ChytPageCliqueAcl() {
    const alias = useSelector(getChytCurrentAlias);
    return (
        Boolean(alias) && (
            <AccessContentAcl path={`//sys/access_control_object_namespaces/chyt/${alias}`} />
        )
    );
}
