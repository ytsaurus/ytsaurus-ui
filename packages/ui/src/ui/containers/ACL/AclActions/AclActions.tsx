import cn from 'bem-cn-lite';
import React, {Component} from 'react';

import {Flex} from '@gravity-ui/uikit';

import ErrorBoundary from '../../../components/ErrorBoundary/ErrorBoundary';
import {isIdmAclAvailable} from '../../../config';
import {AclMode, IdmObjectType} from '../../../constants/acl';
import {type IdmKindType} from '../../../utils/acl/acl-types';
import {type ACLReduxProps} from '../ACL-connect-helpers';
import {AddGroupButton} from '../AddGroupButton/AddGroupButton';
import ManageAcl from '../ManageAcl/ManageAcl';
import ManageInheritance from '../ManageInheritance/ManageInheritance';
import RequestPermissions from '../RequestPermissions/RequestPermissions';

const block = cn('acl-user-permissions');

type Props = Pick<
    ACLReduxProps,
    | 'path'
    | 'cluster'
    | 'version'
    | 'loadAclData'
    | 'loading'
    | 'error'
    | 'errorData'
    | 'responsible'
    | 'auditors'
    | 'readApprovers'
    | 'bossApproval'
    | 'disableInheritanceResponsible'
    | 'columnGroups'
    | 'rowGroups'
    | 'aclMode'
    | 'nodeType'
> & {
    className?: string;
    idmKind: IdmKindType;

    // for RequestPermissions
    requestPermissions: ACLReduxProps['userPermissionsRequestFn'];
    requestPermissionsError: ACLReduxProps['userPermissionsRequestError'];
    cancelRequestPermissions: ACLReduxProps['userPermissionsCancelRequestFn'];

    // for ManageAcl
    inheritAcl: ACLReduxProps['disableAclInheritance'];

    updateAcl: ACLReduxProps['userPermissionsUpdateAcl'];
    updateAclError: ACLReduxProps['userPermissionsUpdateAclError'];
    cancelUpdateAcl: ACLReduxProps['userPermissionsCancelUpdateAcl'];
};

export class AclActions extends Component<Props> {
    requestPermissions = async (...args: Parameters<ACLReduxProps['userPermissionsRequestFn']>) => {
        const {requestPermissions, loadAclData, path, idmKind} = this.props;
        await requestPermissions(...args);
        await loadAclData({path, idmKind});
    };

    updateAcl = async (...args: Parameters<ACLReduxProps['userPermissionsUpdateAcl']>) => {
        const {updateAcl, loadAclData, path, idmKind} = this.props;
        await updateAcl(...args);
        await loadAclData({path, idmKind});
    };

    render() {
        const {
            aclMode,
            path,
            idmKind,
            version,
            className,
            requestPermissionsError,
            cancelRequestPermissions,

            loadAclData,
            loading,
            error,
            errorData,

            inheritAcl,
            bossApproval,
            disableInheritanceResponsible,

            auditors,
            readApprovers,
            responsible,

            updateAclError,
            cancelUpdateAcl,
            cluster,

            columnGroups,
            rowGroups,

            nodeType,
        } = this.props;

        const isMainPermissionsMode = !aclMode || aclMode === AclMode.MAIN_PERMISSIONS;
        const allowAddGroup =
            aclMode === AclMode.ROW_GROUPS_PERMISSIONS ||
            aclMode === AclMode.COLUMN_GROUPS_PERMISSIONS;

        return (
            <ErrorBoundary>
                {idmKind !== IdmObjectType.UI_EFFECTIVE_ACL && (
                    <Flex className={block(null, className)} gap={4}>
                        <React.Fragment>
                            <RequestPermissions
                                aclMode={aclMode}
                                path={path}
                                idmKind={idmKind}
                                error={requestPermissionsError}
                                requestPermissions={this.requestPermissions}
                                cancelRequestPermissions={cancelRequestPermissions}
                                cluster={cluster}
                                columnGroups={columnGroups}
                                rowGroups={rowGroups}
                            />
                            {isMainPermissionsMode && (
                                <ManageInheritance
                                    loadAclData={loadAclData}
                                    loading={loading}
                                    error={error}
                                    errorData={errorData}
                                    path={path}
                                    idmKind={idmKind}
                                    version={version}
                                    inheritAcl={inheritAcl}
                                    updateAcl={this.updateAcl}
                                    manageAclError={updateAclError}
                                    cancelUpdateAcl={cancelUpdateAcl}
                                />
                            )}
                            {isMainPermissionsMode && (
                                <ManageAcl
                                    loadAclData={loadAclData}
                                    loading={loading}
                                    error={error}
                                    errorData={errorData}
                                    path={path}
                                    idmKind={idmKind}
                                    version={version}
                                    bossApproval={bossApproval}
                                    disableInheritanceResponsible={disableInheritanceResponsible}
                                    auditors={auditors}
                                    readApprovers={readApprovers}
                                    responsible={responsible}
                                    updateAcl={this.updateAcl}
                                    manageAclError={updateAclError}
                                    cancelUpdateAcl={cancelUpdateAcl}
                                />
                            )}
                            {isIdmAclAvailable() && allowAddGroup && (
                                <AddGroupButton
                                    loadAclDataFn={() => loadAclData({path, idmKind})}
                                    {...{cluster, path, nodeType, aclMode}}
                                />
                            )}
                        </React.Fragment>
                    </Flex>
                )}
            </ErrorBoundary>
        );
    }
}
