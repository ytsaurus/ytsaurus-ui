import {connect} from 'react-redux';

import RequestPermissions from '../../../../../containers/ACL/RequestPermissions/RequestPermissions';
import {
    selectDenyColumnsItems,
    selectIdmPermissionsRequestError,
} from '../../../../../store/selectors/acl/acl';
import {cancelRequestPermissions, requestPermissions} from '../../../../../store/actions/acl';
import {IdmObjectType} from '../../../../../constants/acl';

const idmKind = IdmObjectType.PATH;

const mapStateToProps = (state) => {
    const denyColumns = selectDenyColumnsItems(state, idmKind);

    return {
        idmKind,
        denyColumns,
        error: selectIdmPermissionsRequestError(state, idmKind),
    };
};

export default connect(mapStateToProps, {requestPermissions, cancelRequestPermissions})(
    RequestPermissions,
);
