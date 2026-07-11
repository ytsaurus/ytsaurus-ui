import {Flex, Loader} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import compact_ from 'lodash/compact';
import React, {Component, Fragment} from 'react';
import {
    SegmentControl,
    type SegmentControlItem,
} from '../../components/SegmentControl/SegmentControl';
import {isIdmAclAvailable} from '../../config';
import {AclMode, IdmObjectType} from '../../constants/acl';
import ErrorBoundary from '../../containers/ErrorBoundary/ErrorBoundary';
import LoadDataHandler from '../../containers/LoadDataHandler/LoadDataHandler';
import withVisible, {type WithVisibleProps} from '../../hocs/withVisible';
import UIFactory, {type AclRoleActionsType} from '../../UIFactory';
import {type PreparedRole, isGranted} from '../../utils/acl';
import {type ACLReduxProps} from './ACL-connect-helpers';
import {type ApproverRow, type PermissionsRow} from './ACL-types';
import './ACL.scss';
import {AclActions} from './AclActions/AclActions';
import {AclModeControl} from './AclModeControl';
import {AclTableWithToolbar} from './AclTableWithToolbar/AclTableWithToolbar';
import ApproversFilters from './ApproversFilters/ApproversFilters';
import ColumnGroups from './ColumnGroups/ColumnGroups';
import DeletePermissionModal from './DeletePermissionModal/DeletePermissionModal';
import {getAclColumns} from './hooks/use-acl-columns/use-acl-columns';
import i18n from './i18n';
import {MyPermissions} from './MyPermissinos/MyPermissions';
import ObjectPermissionsFilters from './ObjectPermissionsFilters/ObjectPermissionsFilters';
import {RowGroups} from './RowGroups/RowGroups';

const block = cn('navigation-acl');

type Props = ACLReduxProps & WithVisibleProps & {className?: string};

class ACL extends Component<Props> {
    static tableColumns = {
        items: {
            inherited: {
                caption: '',
                align: 'center',
            },
            subjects: {
                align: 'left',
            },
            permissions: {
                align: 'left',
            },
            columns: {
                caption: 'Private columns',
                align: 'left',
            },
            inheritance_mode: {
                align: 'left',
            },
            actions: {
                caption: '',
                align: 'right',
            },
            responsibles: {
                align: 'left',
            },
            read_approvers: {
                align: 'left',
            },
            auditors: {
                align: 'left',
            },
            approve_type: {
                align: 'left',
                caption: 'Type',
            },
        },
        sets: {
            objectDefault: {
                items: ['inherited', 'subjects', 'permissions', 'inheritance_mode', 'actions'],
            },
            columns: {
                items: ['inherited', 'subjects', 'columns'],
            },
            approvers: {
                items: ['inherited', 'subjects', 'approve_type', 'actions'],
            },
        },
    };

    state = {
        deleteItem: {} as {key?: string},
    };

    componentDidMount() {
        const {path, idmKind, loadAclData} = this.props;

        if (path) {
            loadAclData({path, idmKind});
        }
    }

    componentDidUpdate(prevProps: Props) {
        const {path, idmKind, loadAclData} = this.props;
        if (prevProps.path !== path) {
            loadAclData({path, idmKind});
        }
    }

    handleDeletePermissionClick = (deleteItem: AclRoleActionsType) => {
        const {handleShow} = this.props;
        this.setState({deleteItem}, handleShow);
    };

    handleCloseDeleteModal = () => {
        const {handleClose} = this.props;
        this.setState({deleteItem: {}}, handleClose);
    };

    renderApprovers() {
        const {hasApprovers, approversFiltered, loaded, toggleExpandAclSubject} = this.props;

        const tableColumns = getAclColumns<ApproverRow>(['subjects', 'approve_type', 'actions'], {
            hasInherited: true,
            onExpandAclSubject: toggleExpandAclSubject,
            renderRoleActions: this.renderRoleActions.bind(this, 'responsible'),
        });
        return (
            hasApprovers && (
                <AclTableWithToolbar
                    className={block('approvers')}
                    title={i18n('title_responsibles')}
                    toolbar={<ApproversFilters />}
                    noItemsText={i18n('alert_no-responsibles')}
                    items={approversFiltered}
                    loaded={loaded}
                    columns={tableColumns}
                />
            )
        );
    }

    getObjectPermissionsDetails() {
        const {aclMode, mainPermissions, columnsPermissions, rowPermissions} = this.props;

        const {data, title, noItemsText, extraColumns} = {
            [AclMode.MAIN_PERMISSIONS]: {
                data: mainPermissions,
                title: i18n('title_object-permissions'),
                noItemsText: i18n('alert_no-column-permissions'),
                extraColumns: ['permissions'] as const,
            },
            [AclMode.COLUMN_GROUPS_PERMISSIONS]: {
                data: columnsPermissions,
                title: i18n('title_private-columns-permissions'),
                noItemsText: i18n('alert_no-permissions'),
                extraColumns: ['columns'] as const,
            },
            [AclMode.ROW_GROUPS_PERMISSIONS]: {
                data: rowPermissions,
                title: i18n('title_private-rows-permissions'),
                noItemsText: i18n('alert_no-permissions'),
                extraColumns: ['row_access_predicate'] as const,
            },
        }[aclMode];

        return {
            data,
            columns: [
                ...(data.hasExpandable ? ['expand' as const] : []),
                'subjects',
                ...(data.hasDenyAction ? ['permissions' as const] : []),
                ...extraColumns,
                'inheritance_mode',
                'actions',
            ] as const,
            title,
            noItemsText,
        };
    }

    renderObjectPermissions() {
        const {loaded, loading, toggleExpandAclSubject} = this.props;

        const {
            title,
            columns,
            data: {hasInherited, items},
            noItemsText,
        } = this.getObjectPermissionsDetails();

        const tableColumns = getAclColumns<PermissionsRow>(columns, {
            hasInherited,
            onExpandAclSubject: toggleExpandAclSubject,
            renderRoleActions: this.renderRoleActions.bind(this, 'permissions'),
        });

        return (
            <AclTableWithToolbar
                className={block('object-permissions')}
                title={title}
                noItemsText={noItemsText}
                items={items}
                loading={loading}
                loaded={loaded}
                columns={tableColumns}
                toolbar={this.renderObjectPermissionsToolbar()}
            />
        );
    }

    renderRoleActions = (mode: 'responsible' | 'permissions', {row}: {row: AclRoleActionsType}) => {
        const {idmKind} = this.props;
        const expanded = 'expanded' in row ? row.expanded : undefined;
        const RoleActions = UIFactory.getComponentForAclRoleActions();
        return expanded !== undefined
            ? null
            : RoleActions !== undefined && (
                  <RoleActions
                      mode={mode}
                      role={row}
                      idmKind={idmKind}
                      onDelete={this.handleDeletePermissionClick}
                  />
              );
    };

    renderObjectPermissionsToolbar() {
        const {aclMode, idmKind, columnsFilter, updateAclFilters, userPermissionsAccessColumns} =
            this.props;

        return (
            <ObjectPermissionsFilters
                {...{
                    aclMode,
                    idmKind,
                    columnsFilter,
                    updateAclFilters,
                    userPermissionsAccessColumns,
                }}
            />
        );
    }

    renderColumnGroups() {
        const {
            loaded,
            columnGroups,
            idmKind,
            path,
            loadAclData,
            cluster,
            nodeType,
            updateAclFilters,
            columnsFilter,
            columnGroupNameFilter,
            userPermissionsAccessColumns,
        } = this.props;

        const allowEditColumnGroups = UIFactory.getAclApi().isAllowedToEditColumnGroups({
            nodeType,
        });
        const {allowEdit, allowEditNotice} =
            typeof allowEditColumnGroups === 'boolean'
                ? {allowEdit: allowEditColumnGroups}
                : allowEditColumnGroups;

        const props = {
            path,
            loadAclDataFn: () => loadAclData({path, idmKind}),
            columnGroups,
            cluster,
            allowEdit,
            allowEditNotice,
            updateAclFilters,
            columnsFilter,
            columnGroupNameFilter,
            userPermissionsAccessColumns,
        };
        return isIdmAclAvailable() && idmKind === IdmObjectType.PATH ? (
            <ColumnGroups loaded={loaded} {...props} />
        ) : null;
    }

    renderRowGroups() {
        const {
            cluster,
            loaded,
            rowGroups,
            idmKind,
            nodeType,
            updateAclFilters,
            rowGroupNameFilter,
            loadAclData,
            path,
        } = this.props;

        const {allowEdit} = UIFactory.getAclApi().isAllowedToEditRowGroups({nodeType});

        return isIdmAclAvailable() && idmKind === IdmObjectType.PATH ? (
            <RowGroups
                loaded={loaded}
                {...{
                    cluster,
                    idmKind,
                    path,
                    allowEdit,
                    rowGroups,
                    rowGroupNameFilter,
                    updateAclFilters,
                    loadAclDataFn: () => loadAclData({path, idmKind}),
                }}
            />
        ) : null;
    }

    deletePermissionsFn = async (...args: Parameters<Props['deletePermissionsFn']>) => {
        const {deletePermissionsFn, loadAclData, idmKind, path} = this.props;
        const res = await deletePermissionsFn(...args);
        await loadAclData({path, idmKind});
        return res;
    };

    renderContent() {
        const {
            disableAclInheritance,
            visible,
            bossApproval,
            disableInheritanceResponsible,
            path,
            idmKind,
            version,
            userPermissionsRequestError,
            userPermissionsRequestFn,
            userPermissionsCancelRequestFn,
            isPermissionDeleted,
            deletePermissionsLastItemKey,
            deletePermissionsError,
            loadAclData,
            loading,
            loaded,
            error,
            errorData,
            auditors,
            readApprovers,
            responsible,
            userPermissionsUpdateAcl,
            userPermissionsUpdateAclError,
            userPermissionsCancelUpdateAcl,
            cluster,
            columnGroups,
            rowGroups,
            aclMode,
            updateAclFilters,
            mainPermissions,
            columnsPermissions,
            rowPermissions,
            allowSwitchMode,
            nodeType,
        } = this.props;
        const {deleteItem} = this.state;

        return (
            <Fragment>
                <Flex className={block('toolbar', {'has-columns': allowSwitchMode})}>
                    {allowSwitchMode && (
                        <Flex grow>
                            <AclModeControl
                                {...{aclMode, updateAclFilters}}
                                permissionCounters={{
                                    [AclMode.MAIN_PERMISSIONS]: mainPermissions.count,
                                    [AclMode.COLUMN_GROUPS_PERMISSIONS]: columnsPermissions.count,
                                    [AclMode.ROW_GROUPS_PERMISSIONS]: rowPermissions.count,
                                }}
                            />
                        </Flex>
                    )}
                    {loaded && (
                        <AclActions
                            cluster={cluster}
                            className={block('acl-actions')}
                            path={path}
                            idmKind={idmKind}
                            version={version}
                            requestPermissions={userPermissionsRequestFn}
                            requestPermissionsError={userPermissionsRequestError}
                            cancelRequestPermissions={userPermissionsCancelRequestFn}
                            loadAclData={loadAclData}
                            loading={loading}
                            error={error}
                            errorData={errorData}
                            inheritAcl={!disableAclInheritance}
                            bossApproval={bossApproval}
                            disableInheritanceResponsible={disableInheritanceResponsible}
                            auditors={auditors}
                            readApprovers={readApprovers}
                            responsible={responsible}
                            updateAcl={userPermissionsUpdateAcl}
                            updateAclError={userPermissionsUpdateAclError}
                            cancelUpdateAcl={userPermissionsCancelUpdateAcl}
                            columnGroups={columnGroups}
                            rowGroups={rowGroups}
                            aclMode={aclMode}
                            nodeType={nodeType}
                        />
                    )}
                </Flex>
                {this.renderMeta()}

                {this.renderContentByMode()}
                {this.renderObjectPermissions()}

                <DeletePermissionModal
                    idmKind={idmKind}
                    path={path}
                    key={deleteItem?.key}
                    visible={visible}
                    itemToDelete={deleteItem}
                    handleClose={this.handleCloseDeleteModal}
                    isPermissionDeleted={isPermissionDeleted}
                    lastItemKey={deletePermissionsLastItemKey}
                    deletePermissions={this.deletePermissionsFn}
                    error={deletePermissionsError}
                />
            </Fragment>
        );
    }

    renderContentByMode() {
        const {aclMode} = this.props;
        switch (aclMode) {
            case AclMode.COLUMN_GROUPS_PERMISSIONS:
                return this.renderColumnGroups();
            case AclMode.ROW_GROUPS_PERMISSIONS:
                return this.renderRowGroups();
            default:
                return this.renderApprovers();
        }
    }

    renderMeta() {
        const {
            idmKind,
            path,
            disableAclInheritance,
            bossApproval,
            disableInheritanceResponsible,
            userPermissions,
            inheritAcl,
        } = this.props;
        const {allowBossApprovals, allowInheritAcl, allowInheritResponsibles} =
            UIFactory.getAclPermissionsSettings()[idmKind];

        function toSegmentItem(
            name: string,
            role?: boolean | PreparedRole,
            {invertRole, envforceValue}: {invertRole?: boolean; envforceValue?: boolean} = {},
        ) {
            const granted = isGranted(role);
            return {
                name,
                value: envforceValue ?? (invertRole ? !granted : granted),
                role: typeof role === 'object' ? role : undefined,
            };
        }

        const segments: Array<SegmentControlItem> = compact_([
            allowInheritAcl &&
                toSegmentItem(i18n('field_inherit-acl'), disableAclInheritance, {
                    invertRole: true,
                    envforceValue: inheritAcl,
                }),
            isIdmAclAvailable() &&
                allowBossApprovals &&
                toSegmentItem(i18n('field_boss-approval'), bossApproval),
            isIdmAclAvailable() &&
                allowInheritResponsibles &&
                toSegmentItem(i18n('field_inherit-responsibles'), disableInheritanceResponsible, {
                    invertRole: true,
                }),
        ]);

        const {
            mainPermissions,
            columnsPermissions,
            rowPermissions,
            approversFiltered,
            columnGroups,
            rowGroups,
            aclMode,
            allowSwitchMode,
        } = this.props;

        const counters: Array<SegmentControlItem> = {
            [AclMode.MAIN_PERMISSIONS]: [
                {name: i18n('title_responsibles'), value: approversFiltered.length},
                {name: i18n('title_object-permissions'), value: mainPermissions.count},
            ],
            [AclMode.COLUMN_GROUPS_PERMISSIONS]: [
                {name: i18n('title_column-groups'), value: columnGroups.length},
                {name: i18n('title_column-permissions'), value: columnsPermissions.count},
            ],
            [AclMode.ROW_GROUPS_PERMISSIONS]: [
                {name: i18n('title_row-groups'), value: rowGroups?.length ?? 0},
                {name: i18n('title_row-permissions'), value: rowPermissions.count},
            ],
        }[aclMode];
        return (
            <Flex className={block('meta')} wrap alignItems="center">
                <SegmentControl
                    className={block('meta-item')}
                    background="neutral-light"
                    groups={[segments, counters].filter((x) => x?.length > 0)}
                />
                {aclMode === AclMode.MAIN_PERMISSIONS && (
                    <MyPermissions
                        className={block('meta-item', {'with-buttons': !allowSwitchMode})}
                        userPermissions={userPermissions}
                        path={path}
                        idmKind={idmKind}
                    />
                )}
            </Flex>
        );
    }

    render() {
        const {loading, loaded, className} = this.props;
        const initialLoading = loading && !loaded;

        return (
            <ErrorBoundary>
                <LoadDataHandler {...this.props}>
                    <div className={block({loading: initialLoading}, className)}>
                        {initialLoading ? <Loader /> : this.renderContent()}
                    </div>
                </LoadDataHandler>
            </ErrorBoundary>
        );
    }
}

export default withVisible(ACL);
