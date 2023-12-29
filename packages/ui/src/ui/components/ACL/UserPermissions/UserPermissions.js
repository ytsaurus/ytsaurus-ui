import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import hammer from '../../../common/hammer';
import cn from 'bem-cn-lite';
import _ from 'lodash';

import CollapsibleList from '../../../components/CollapsibleList/CollapsibleList';
import ErrorBoundary from '../../../components/ErrorBoundary/ErrorBoundary';
import Icon from '../../../components/Icon/Icon';

import RequestPermissions from '../RequestPermissions/RequestPermissions';
import ManageAcl from '../ManageAcl/ManageAcl';

import './UserPermissions.scss';

const block = cn('acl-user-permissions');

export default class UserPermissions extends Component {
    static PermissionsType = PropTypes.arrayOf(
        PropTypes.shape({
            type: PropTypes.string.isRequired,
            action: PropTypes.string.isRequired,
        }),
    ).isRequired;

    static propTypes = {
        // from parent
        cluster: PropTypes.string,
        className: PropTypes.string,
        path: PropTypes.string.isRequired,
        idmKind: PropTypes.string.isRequired,
        aclRequestOptions: PropTypes.shape({
            useEffective: PropTypes.bool,
            skipResponsible: PropTypes.bool,
        }),
        version: PropTypes.string,

        permissions: UserPermissions.PermissionsType,
        accessColumns: PropTypes.arrayOf(PropTypes.string).isRequired,

        // for RequestPermissions
        requestPermissions: PropTypes.func.isRequired,
        requestPermissionsError: PropTypes.any,
        cancelRequestPermissions: PropTypes.func.isRequired,

        // for ManageAcl
        loadAclData: PropTypes.func.isRequired,
        loading: PropTypes.bool.isRequired,
        loaded: PropTypes.bool.isRequired,
        error: PropTypes.bool.isRequired,
        errorData: PropTypes.object.isRequired,

        inheritAcl: PropTypes.bool,
        bossApproval: PropTypes.object,
        disableInheritanceResponsible: PropTypes.object,

        auditors: PropTypes.arrayOf(PropTypes.object),
        readApprovers: PropTypes.arrayOf(PropTypes.object),
        responsible: PropTypes.arrayOf(PropTypes.object),

        updateAcl: PropTypes.func.isRequired,
        updateAclError: PropTypes.object,
        cancelUpdateAcl: PropTypes.func.isRequired,
        aclType: PropTypes.string,
    };

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

    requestPermissions = (...args) => {
        const {requestPermissions, loadAclData, path, idmKind, aclType} = this.props;
        return requestPermissions(...args).then((d) => {
            loadAclData({path, idmKind, aclType});
            return d;
        });
    };

    updateAcl = (...args) => {
        const {updateAcl, loadAclData, path, idmKind} = this.props;
        return updateAcl(...args).then((d) => {
            loadAclData({path, idmKind});
            return d;
        });
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
            loaded,
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
            aclRequestOptions,
            aclType,
        } = this.props;

        const {useEffective} = aclRequestOptions;

        return (
            <ErrorBoundary>
                <div className={block(null, className)}>
                    {this.renderCard()}
                    {!useEffective && (
                        <React.Fragment>
                            <RequestPermissions
                                className={block('request')}
                                path={path}
                                aclType={aclType}
                                idmKind={idmKind}
                                error={requestPermissionsError}
                                requestPermissions={this.requestPermissions}
                                cancelRequestPermissions={cancelRequestPermissions}
                                cluster={cluster}
                            />

                            <ManageAcl
                                loadAclData={loadAclData}
                                loading={loading}
                                loaded={loaded}
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
                                aclType={aclType}
                            />
                        </React.Fragment>
                    )}
                </div>
            </ErrorBoundary>
        );
    }
}
