import {type ConnectedProps, connect} from 'react-redux';

import {
    selectAllAccessColumnsNames,
    selectAllColumnGroupsActual,
    selectAllRowGroupsActual,
    selectAllUserPermissions,
    selectApproversFilteredAndOrdered,
    selectHasApprovers,
    selectIdmManageAclRequestError,
    selectIdmPathVersion,
    selectIdmPermissionsRequestError,
    selectIsPermissionDeleted,
    selectLastDeletedPermissionKey,
    selectNotInheritedAuditors,
    selectNotInheritedReadApprovers,
    selectNotInheritedResponsibles,
    selectObjectPermissionsAggregated,
    selectPermissionDeletionError,
} from '../../store/selectors/acl/acl';

import {getType} from '../../store/selectors/navigation';

import {
    selectAclCurrentTab,
    selectAclFilterColumnGroupName,
    selectAclFilterColumns,
    selectAclFilterRowGroupName,
} from '../../store/selectors/acl/acl-filters';

import {
    cancelRequestPermissions,
    cancelUpdateAcl,
    deletePermissions,
    loadAclData,
    requestPermissions,
    updateAcl,
} from '../../store/actions/acl';

import {selectCluster} from '../../store/selectors/global';
import {normalizeIdmParams} from '../../utils/acl';
import {AclMode, IdmObjectType} from '../../constants/acl';
import {type IdmKindType} from '../../utils/acl/acl-types';
import {type RootState} from '../../store/reducers';
import {toggleExpandAclSubject, updateAclFilters} from '../../store/actions/acl-filters';

import ACL from './ACL';

export type ACLOwnProps = {
    path: string;
    poolTree?: string;
};

const makeAclMapStateToProps = (inputIdmKind: IdmKindType) => {
    return (state: RootState, ownProps: ACLOwnProps) => {
        const normalizedParams = normalizeIdmParams(inputIdmKind, ownProps.path);
        const {
            idmKind,
            path,
            pool_tree: normalizedPoolTree,
            userPermissionsPath,
        } = normalizedParams;

        const aclRequestOptions = {
            userPermissionsPath,
        };

        const {
            loaded,
            loading,
            error,
            errorData,
            disableAclInheritance,
            bossApproval,
            disableInheritanceResponsible,
            inheritAcl,
        } = state.acl[idmKind];

        const hasApprovers = selectHasApprovers(state, idmKind);
        const approversFiltered = selectApproversFilteredAndOrdered(state, idmKind);
        const {mainPermissions, columnsPermissions, rowPermissions} =
            selectObjectPermissionsAggregated(state, idmKind);
        const columnGroups = selectAllColumnGroupsActual(state, idmKind);
        const rowGroups = selectAllRowGroupsActual(state, idmKind);
        const userPermissions = selectAllUserPermissions(state, idmKind);

        const columnsFilter = selectAclFilterColumns(state);

        const auditors = selectNotInheritedAuditors(state, idmKind);
        const readApprovers = selectNotInheritedReadApprovers(state, idmKind);
        const responsible = selectNotInheritedResponsibles(state, idmKind);

        const nodeType = getType(state);

        return {
            cluster: selectCluster(state),

            loading,
            loaded,
            error,
            errorData,

            path,
            nodeType,
            version: selectIdmPathVersion(state, idmKind),
            idmKind,
            disableAclInheritance,
            inheritAcl,
            bossApproval,
            disableInheritanceResponsible,
            mainPermissions,
            columnsPermissions,
            rowPermissions,
            hasApprovers,
            approversFiltered,
            auditors,
            readApprovers,
            responsible,

            userPermissions,
            userPermissionsRequestError: selectIdmPermissionsRequestError(state, idmKind),
            userPermissionsAccessColumns: selectAllAccessColumnsNames(state, idmKind),
            userPermissionsUpdateAclError: selectIdmManageAclRequestError(state, idmKind),

            isPermissionDeleted: selectIsPermissionDeleted(state, idmKind),
            deletePermissionsLastItemKey: selectLastDeletedPermissionKey(state, idmKind),
            deletePermissionsError: selectPermissionDeletionError(state, idmKind),

            columnGroups,
            columnsFilter,
            columnGroupNameFilter: selectAclFilterColumnGroupName(state),

            rowGroups,
            rowGroupNameFilter: selectAclFilterRowGroupName(state),

            normalizedPoolTree,
            aclRequestOptions,

            aclMode: idmKind !== 'path' ? AclMode.MAIN_PERMISSIONS : selectAclCurrentTab(state),
            allowSwitchMode: idmKind === 'path',
        };
    };
};

const makeAclMapDispatchToProps = () => ({
    loadAclData,
    userPermissionsRequestFn: requestPermissions,
    userPermissionsCancelRequestFn: cancelRequestPermissions,
    userPermissionsUpdateAcl: updateAcl,
    userPermissionsCancelUpdateAcl: cancelUpdateAcl,
    deletePermissionsFn: deletePermissions,
    updateAclFilters,
    toggleExpandAclSubject,
});

type StateProps = ReturnType<ReturnType<typeof makeAclMapStateToProps>>;
type DispatchProps = ReturnType<typeof makeAclMapDispatchToProps>;

function mergeProps(stateProps: StateProps, dispatchProps: DispatchProps, ownProps: ACLOwnProps) {
    const {normalizedPoolTree, aclRequestOptions} = stateProps;
    const {
        loadAclData,
        deletePermissionsFn,
        userPermissionsRequestFn,
        userPermissionsUpdateAcl,
        ...restDispatchProps
    } = dispatchProps;
    return {
        ...ownProps,
        ...stateProps,
        ...restDispatchProps,
        loadAclData: (params: Parameters<typeof loadAclData>[0]) => {
            return loadAclData({...params}, {normalizedPoolTree}, aclRequestOptions);
        },
        deletePermissionsFn: (params: Parameters<typeof deletePermissionsFn>[0]) => {
            return deletePermissionsFn(params, {normalizedPoolTree});
        },
        userPermissionsRequestFn: (params: Parameters<typeof userPermissionsRequestFn>[0]) => {
            return userPermissionsRequestFn(params, {normalizedPoolTree});
        },
        userPermissionsUpdateAcl: (params: Parameters<typeof userPermissionsUpdateAcl>[0]) => {
            return userPermissionsUpdateAcl(params, {normalizedPoolTree});
        },
    };
}

function createACLConnector(idmKind: IdmKindType) {
    const mapStateToProps = makeAclMapStateToProps(idmKind);
    const mapDispatchToProps = makeAclMapDispatchToProps();
    return connect(mapStateToProps, mapDispatchToProps, mergeProps);
}

function createACLComponent(idmKind: IdmKindType) {
    return createACLConnector(idmKind)(ACL) as unknown as React.ComponentType<
        Pick<React.ComponentProps<typeof ACL>, 'path' | 'poolTree'>
    >;
}

type ConnectorType = ReturnType<typeof createACLConnector>;

export type ACLReduxProps = ConnectedProps<ConnectorType>;

export const AccessContentAcl = createACLComponent(IdmObjectType.ACCESS_CONTROL_OBJECT);

export const NavigationAcl = createACLComponent(IdmObjectType.PATH);

export const PoolAclPanel = createACLComponent(IdmObjectType.POOL);

export const AccountsAcl = createACLComponent(IdmObjectType.ACCOUNT);

export const BundleAcl = createACLComponent(IdmObjectType.TABLET_CELL_BUNDLE);

export {default as RoleActions} from './RoleActions';
