import React from 'react';
import {useSelector} from 'react-redux';

import {getChytCurrentAlias} from '../../../store/selectors/chyt';
import {AccessContentAcl} from '../../../components/ACL/ACL-connect-helpers';

export function ChytPageCliqueAcl() {
    const alias = useSelector(getChytCurrentAlias);
    return <AccessContentAcl path={`//sys/access_control_object_namespaces/chyt/${alias}`} />;
}
