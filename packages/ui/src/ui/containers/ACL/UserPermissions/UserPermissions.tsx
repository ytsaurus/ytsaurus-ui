import React, {Component, Fragment} from 'react';
import hammer from '../../../common/hammer';
import cn from 'bem-cn-lite';
import _ from 'lodash';

import CollapsibleList from '../../../components/CollapsibleList/CollapsibleList';
import ErrorBoundary from '../../../components/ErrorBoundary/ErrorBoundary';
import Icon from '../../../components/Icon/Icon';
import {IdmObjectType} from '../../../constants/acl';

import RequestPermissions from '../RequestPermissions/RequestPermissions';
import ManageAcl from '../ManageAcl/ManageAcl';
import {ACLReduxProps} from '../ACL-connect-helpers';
import {IdmKindType} from '../../../utils/acl/acl-types';

import './UserPermissions.scss';

const block = cn('acl-user-permissions');

type Props = Pick<
    ACLReduxProps,
    | 'path'
    | 'cluster'
    | 'version'
    | 'loadAclData'
    | 'loaded'
    | 'loading'
    | 'error'
    | 'errorData'
    | 'responsible'
    | 'auditors'
    | 'readApprovers'
    | 'bossApproval'
    | 'disableInheritanceResponsible'
> & {
    className?: string;
    idmKind: IdmKindType;

    permissions: ACLReduxProps['userPermissions'];
    accessColumns: ACLReduxProps['userPermissionsAccessColumns'];

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

export default class UserPermissions extends Component<Props> {
    renderPermissions() {
        const {permissions} = this.props;

        return (
            <Fragment>
                <div className="elements-heading elements-heading_size_xs">General</div>

                <ul className={block('list', block('permissions-list'))}>
                    {_.map(permissions, ({type, action}) => {
                        const icon = action === 'deny' ? 'times' : 'check';

                        return (
                            <li className={block('item', {type: action})} key={type}>
                                <Icon awesome={icon} />
                                {hammer.format.Readable(type)}
                            </li>
                        );
                    })}
                </ul>
            </Fragment>
        );
    }

    renderColumns() {
        const {accessColumns} = this.props;
        const items = _.map(accessColumns, (column) => (
            <li key={column} className={block('item', block('columns-item'))}>
                &quot;{column}&quot;
            </li>
        ));

        return (
            items.length > 0 && (
                <Fragment>
                    <div className="elements-heading elements-heading_size_xs">
                        Accessible private columns
                    </div>

                    <CollapsibleList
                        className={block('list', block('columns-list'))}
                        itemsCount={15}
                        items={items}
                    />
                </Fragment>
            )
        );
    }

    renderCard() {
        return (
            <div className={block('card')}>
                <div className="elements-heading elements-heading_size_m">
                    <b>My permissions</b>
                </div>

                {this.renderPermissions()}
                {this.renderColumns()}
            </div>
        );
    }

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
        } = this.props;

        return (
            <ErrorBoundary>
                <div className={block(null, className)}>
                    {this.renderCard()}
                    {idmKind !== IdmObjectType.UI_EFFECTIVE_ACL && (
                        <React.Fragment>
                            <RequestPermissions
                                className={block('request')}
                                path={path}
                                idmKind={idmKind}
                                error={requestPermissionsError}
                                requestPermissions={this.requestPermissions}
                                cancelRequestPermissions={cancelRequestPermissions}
                                cluster={cluster}
                            />

                            <ManageAcl
                                loadAclData={loadAclData}
                                loading={loading}
                                error={error}
                                errorData={errorData}
                                path={path}
                                idmKind={idmKind}
                                version={version}
                                inheritAcl={inheritAcl}
                                bossApproval={bossApproval}
                                disableInheritanceResponsible={disableInheritanceResponsible}
                                auditors={auditors}
                                readApprovers={readApprovers}
                                responsible={responsible}
                                updateAcl={this.updateAcl}
                                manageAclError={updateAclError}
                                cancelUpdateAcl={cancelUpdateAcl}
                            />
                        </React.Fragment>
                    )}
                </div>
            </ErrorBoundary>
        );
    }
}
