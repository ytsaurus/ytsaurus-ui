import {
    getHasApprovers,
    getApproversFilteredAndOrdered,
    getAllUserPermissions,
    getIdmPermissionsRequestError,
    getAllAccessColumnsNames,
    isPermissionDeleted,
    getLastDeletedPermissionKey,
    permissionDeletionError,
    getIdmManageAclRequestError,
    getIdmPathVersion,
    getAllAccessColumnsPermissionsOrderedByInheritanceAndSubject,
    getAllObjectPermissionsOrderedByInheritanceAndSubject,
    getAllColumnGroupsActual,
    getObjectSubjects,
    getColumnsColumns,
    getAclHightlightedByFilter,
    getNotInheritedAuditors,
    getNotInheritedReadApprovers,
    getNotInheritedResponsibles,
} from '../../store/selectors/acl';

import {
    loadAclData,
    changeObjectSubject,
    changeColumnsColumns,
    requestPermissions,
    cancelRequestPermissions,
    deletePermissions,
    updateAcl,
    cancelUpdateAcl,
} from '../../store/actions/acl';

import {getCluster} from '../../store/selectors/global';
import {normalizeIdmParams} from '../../utils/acl';
import {IdmObjectType} from '../../constants/acl';
import {connect} from 'react-redux';
import ACL from './ACL';

const makeAclMapStateToProps = (inputIdmKind) => {
    return (state, ownProps) => {
        const normalizedParams = normalizeIdmParams(inputIdmKind, ownProps.path);
        const {
            idmKind,
            path,
            pool_tree: normalizedPoolTree,
            useEffective,
            skipResponsible,
            userPermissionsPath,
        } = normalizedParams;

        const aclRequestOptions = {
            useEffective,
            skipResponsible,
            userPermissionsPath,
        };

        const {
            loaded,
            loading,
            error,
            errorData,
            objectSubject,
            columnsSubject,
            columnsColumns,
            disableAclInheritance,
            bossApproval,
            disableInheritanceResponsible,
        } = state.acl[idmKind];

        const hasApprovers = getHasApprovers(state, idmKind);
        const approversFiltered = getApproversFilteredAndOrdered(state, idmKind);
        const columnsPermissions = getAllAccessColumnsPermissionsOrderedByInheritanceAndSubject(
            state,
            idmKind,
        );
        const objectPermissions = getAllObjectPermissionsOrderedByInheritanceAndSubject(
            state,
            idmKind,
        );
        const columnGroups = getAllColumnGroupsActual(state, idmKind);
        const userPermissions = getAllUserPermissions(state, idmKind);

        const subjectFilter = getObjectSubjects(state, idmKind);
        const columnsFilter = getColumnsColumns(state, idmKind);
        const highlightedByFilter = getAclHightlightedByFilter(state, idmKind);

        const auditors = getNotInheritedAuditors(state, idmKind);
        const readApprovers = getNotInheritedReadApprovers(state, idmKind);
        const responsible = getNotInheritedResponsibles(state, idmKind);

        return {
            cluster: getCluster(state),

            loading,
            loaded,
            error,
            errorData,

            path,
            version: getIdmPathVersion(state, idmKind),
            idmKind,
            disableAclInheritance,
            bossApproval,
            disableInheritanceResponsible,
            objectPermissions,
            columnGroups,
            columnsPermissions,
            hasApprovers,
            approversFiltered,
            auditors,
            readApprovers,
            responsible,

            objectSubject,
            columnsSubject,
            columnsColumns,

            userPermissions,
            userPermissionsRequestError: getIdmPermissionsRequestError(state, idmKind),
            userPermissionsAccessColumns: getAllAccessColumnsNames(state, idmKind),
            userPermissionsUpdateAclError: getIdmManageAclRequestError(state, idmKind),

            isPermissionDeleted: isPermissionDeleted(state, idmKind),
            deletePermissionsLastItemKey: getLastDeletedPermissionKey(state, idmKind),
            deletePermissionsError: permissionDeletionError(state, idmKind),

            subjectFilter,
            columnsFilter,
            highlightedByFilter,

            normalizedPoolTree,
            aclRequestOptions,
        };
    };
};

const makeAclMapDispatchToProps = () => ({
    loadAclData,
    changeObjectSubject,
    changeColumnsColumns,
    userPermissionsRequestFn: requestPermissions,
    userPermissionsCancelRequestFn: cancelRequestPermissions,
    userPermissionsUpdateAcl: updateAcl,
    userPermissionsCancelUpdateAcl: cancelUpdateAcl,
    deletePermissionsFn: deletePermissions,
});

const mergeProps = (stateProps, dispatchProps, ownProps) => {
    const {normalizedPoolTree, aclRequestOptions} = stateProps;
    const {loadAclData, userPermissionsRequestFn, userPermissionsUpdateAcl, ...restDispatchProps} =
        dispatchProps;
    return {
        ...ownProps,
        ...stateProps,
        ...restDispatchProps,
        loadAclData: (params) => {
            return loadAclData({...params}, {normalizedPoolTree}, aclRequestOptions);
        },
        userPermissionsRequestFn: (params) => {
            return userPermissionsRequestFn(params, {normalizedPoolTree});
        },
        userPermissionsUpdateAcl: (params) => {
            return userPermissionsUpdateAcl(params, {normalizedPoolTree});
        },
    };
};

function createACLComponent(idmKind) {
    const mapStateToProps = makeAclMapStateToProps(idmKind);
    const mapDispatchToProps = makeAclMapDispatchToProps();
    return connect(mapStateToProps, mapDispatchToProps, mergeProps)(ACL);
}

export const AccessContentAcl = createACLComponent(IdmObjectType.ACCESS_CONTROL_OBJECT);

export const NavigationAcl = createACLComponent(IdmObjectType.PATH);

export const PoolAclPanel = createACLComponent(IdmObjectType.POOL);

export const AccountsAcl = createACLComponent(IdmObjectType.ACCOUNT);

export const BundleAcl = createACLComponent(IdmObjectType.TABLET_CELL_BUNDLE);
