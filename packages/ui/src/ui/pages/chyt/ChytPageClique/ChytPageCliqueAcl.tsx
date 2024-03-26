import React from 'react';
import {useSelector} from 'react-redux';

import {getChytCurrentAlias} from '../../../store/selectors/chyt';
import {AccessContentAcl} from '../../../containers/ACL/ACL-connect-helpers';

export function ChytPageCliqueAcl() {
    const alias = useSelector(getChytCurrentAlias);
    return (
        Boolean(alias) && (
            <AccessContentAcl path={`//sys/access_control_object_namespaces/chyt/${alias}`} />
        )
    );
}
