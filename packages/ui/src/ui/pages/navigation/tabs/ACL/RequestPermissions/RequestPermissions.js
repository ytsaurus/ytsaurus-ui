import {connect} from 'react-redux';

import RequestPermissions from '../../../../../containers/ACL/RequestPermissions/RequestPermissions';
import {
    getDenyColumnsItems,
    getIdmPermissionsRequestError,
} from '../../../../../store/selectors/acl';
import {cancelRequestPermissions, requestPermissions} from '../../../../../store/actions/acl';
import {IdmObjectType} from '../../../../../constants/acl';

const idmKind = IdmObjectType.PATH;

const mapStateToProps = (state) => {
    const denyColumns = getDenyColumnsItems(state, idmKind);

    return {
        idmKind,
        denyColumns,
        error: getIdmPermissionsRequestError(state, idmKind),
    };
};

export default connect(mapStateToProps, {requestPermissions, cancelRequestPermissions})(
    RequestPermissions,
);
