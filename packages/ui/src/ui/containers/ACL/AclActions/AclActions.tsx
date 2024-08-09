import React, {Component} from 'react';
import cn from 'bem-cn-lite';
import _ from 'lodash';

import {Flex} from '@gravity-ui/uikit';

import ErrorBoundary from '../../../components/ErrorBoundary/ErrorBoundary';
import {AclMode, IdmObjectType} from '../../../constants/acl';

import RequestPermissions from '../RequestPermissions/RequestPermissions';
import ManageAcl from '../ManageAcl/ManageAcl';
import {ACLReduxProps} from '../ACL-connect-helpers';
import {IdmKindType} from '../../../utils/acl/acl-types';
import ManageInheritance from '../ManageInheritance/ManageInheritance';

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
    | 'aclMode'
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
        } = this.props;

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
                            />
                            {aclMode !== AclMode.COLUMN_GROUPS_PERMISSISONS && (
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
                            {aclMode !== AclMode.COLUMN_GROUPS_PERMISSISONS && (
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
                        </React.Fragment>
                    </Flex>
                )}
            </ErrorBoundary>
        );
    }
}
