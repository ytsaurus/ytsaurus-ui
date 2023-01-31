import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import hammer from '../../common/hammer';
import cn from 'bem-cn-lite';
import _ from 'lodash';
import HighlightedText from '../../components/HighlightedText/HighlightedText';
import {PERMISSIONS_SETTINGS, IdmObjectType} from '../../constants/acl';

import ColumnGroups from './ColumnGroups/ColumnGroups';

import DeletePermissionModal from './DeletePermissionModal/DeletePermissionModal';
import UserPermissions from './UserPermissions/UserPermissions';

import LoadDataHandler from '../../components/LoadDataHandler/LoadDataHandler';
import ErrorBoundary from '../../components/ErrorBoundary/ErrorBoundary';
import ElementsTable from '../../components/ElementsTable/ElementsTable';
import MetaTable from '../../components/MetaTable/MetaTable';
import Filter from '../../components/Filter/Filter';
import {ClipboardButton, Loader, Popover} from '@gravity-ui/uikit';
import Icon from '../../components/Icon/Icon';
import Link from '../../components/Link/Link';
import {Tooltip} from '../../components/Tooltip/Tooltip';
import {UserName} from '../UserLink/UserLink';

import withVisible from '../../hocs/withVisible';
import {renderText} from '../../components/templates/utils';
import Label from '../../components/Label/Label';
import {isIdmAclAvailable} from '../../config';

import AclColumn from './AclColumn';

import './ACL.scss';

const block = cn('navigation-acl');

function FlagRole({role, invert}) {
    const value = invert ? !role : Boolean(role);
    return (
        <React.Fragment>
            {String(value)}
            {role && <RoleActions role={role} />}
        </React.Fragment>
    );
}

function RoleActions(props) {
    const {role, onDelete, idmKind} = props;
    const {depriveDate, isUnrecognized, isMissing, idmLink} = role;
    const hasFlags = ACL.hasFlags(role);
    const helpTooltip = ACL.helpByFlags(role);
    const canBeRequested = ACL.isMightBeRequested(idmKind, role);

    const handleDelete = React.useCallback(() => {
        onDelete(role);
    }, [role, onDelete]);

    return (
        <React.Fragment>
            {isUnrecognized && (
                <Popover
                    className={block('icon', {unrecognized: true})}
                    content={
                        <React.Fragment>
                            <div>The role is active in YT but is missing in IDM.</div>
                            It means that ACL was edited manually.
                        </React.Fragment>
                    }
                >
                    <Icon awesome="exclamation-triangle" face="solid" />
                </Popover>
            )}
            {isMissing && (
                <Popover
                    className={block('icon', {unrecognized: true})}
                    content={
                        <React.Fragment>
                            <div>The role is active in IDM but is missing in YT.</div>
                            It means that object was removed from YT and later another one was
                            created with the same name. You have to revoke this role from IDM and
                            request a new one.
                        </React.Fragment>
                    }
                >
                    <Icon awesome="exclamation-triangle" face="solid" />
                </Popover>
            )}
            {depriveDate && !hasFlags && (
                <Popover
                    className={block('icon', {deprive: true})}
                    content={`The role is valid until ${depriveDate}`}
                >
                    <Icon awesome="clock" />
                </Popover>
            )}
            {helpTooltip && (
                <Popover className={block('icon', {info: true})} content={helpTooltip}>
                    <Icon awesome="question-circle" face="regular" />
                </Popover>
            )}
            {!hasFlags && !role.inherited && role.group === 'role' && canBeRequested && (
                <span className={block('icon', {delete: true})} onClick={() => handleDelete()}>
                    <Icon awesome="trash-alt" />
                </span>
            )}
            {idmLink && (
                <Link className={block('icon', {link: true})} url={idmLink}>
                    <Icon awesome="link" />
                </Link>
            )}
        </React.Fragment>
    );
}

class ACL extends Component {
    static permissionProps = PropTypes.arrayOf(
        PropTypes.shape({
            permissions: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
            subjects: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
            columns: PropTypes.arrayOf(PropTypes.string.isRequired),
            inheritance_mode: PropTypes.string.isRequired,
            action: PropTypes.string.isRequired,
            inherited: PropTypes.bool,
        }),
    );

    static columnGroupsProps = PropTypes.arrayOf(
        PropTypes.shape({
            columns: PropTypes.arrayOf(PropTypes.string.isRequired),
            id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            enabled: PropTypes.bool,
        }),
    );

    static propTypes = {
        // from withVisible
        visible: PropTypes.bool.isRequired,
        handleClose: PropTypes.func.isRequired,
        handleShow: PropTypes.func.isRequired,

        // from connect
        loading: PropTypes.bool.isRequired,
        loaded: PropTypes.bool.isRequired,
        error: PropTypes.bool.isRequired,
        errorData: PropTypes.object.isRequired,

        path: PropTypes.string.isRequired,
        idmKind: PropTypes.string.isRequired,
        version: PropTypes.string,
        disableAclInheritance: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
        bossApproval: PropTypes.bool,
        disableInheritanceResponsible: PropTypes.bool,
        objectSubject: PropTypes.string.isRequired,
        columnsColumns: PropTypes.string.isRequired,
        objectPermissions: ACL.permissionProps.isRequired,
        columnGroups: ACL.columnGroupsProps.isRequired,
        columnsPermissions: ACL.permissionProps.isRequired,
        approvers: PropTypes.arrayOf(
            PropTypes.shape({
                type: PropTypes.string.isRequired,
                inherited: PropTypes.bool,
                value: PropTypes.string.isRequired,
                subjectType: PropTypes.string.isRequired,
            }),
        ).isRequired,
        auditors: PropTypes.arrayOf(PropTypes.object),
        readApprovers: PropTypes.arrayOf(PropTypes.object),
        responsible: PropTypes.arrayOf(PropTypes.object),

        userPermissions: UserPermissions.PermissionsType,
        userPermissionsRequestError: PropTypes.any,
        userPermissionsAccessColumns: PropTypes.arrayOf(PropTypes.string).isRequired,
        userPermissionsRequestFn: PropTypes.func.isRequired,
        userPermissionsCancelRequestFn: PropTypes.func.isRequired,

        userPermissionsUpdateAcl: PropTypes.func.isRequired,
        userPermissionsUpdateAclError: PropTypes.object,
        userPermissionsCancelUpdateAcl: PropTypes.func.isRequired,

        isPermissionDeleted: PropTypes.bool.isRequired,
        deletePermissionsLastItemKey: PropTypes.string,
        deletePermissionsError: PropTypes.object,
        deletePermissionsFn: PropTypes.func.isRequired,

        loadAclData: PropTypes.func.isRequired,
        changeObjectSubject: PropTypes.func.isRequired,
        changeColumnsColumns: PropTypes.func.isRequired,

        cluster: PropTypes.string,
        aclRequestOptions: PropTypes.shape({
            useEffective: PropTypes.bool,
            inheritAcl: PropTypes.bool,
        }),

        subjectFilter: PropTypes.string,
        columnsFilter: PropTypes.string,
        highlightedByFilter: PropTypes.shape({
            subjects: PropTypes.func.isRequired,
            columns: PropTypes.func.isRequired,
            approverRows: PropTypes.func.isRequired,
            permissionRows: PropTypes.func.isRequired,
            columnRows: PropTypes.isRequired,
        }).isRequired,
    };

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

    // eslint-disable-next-line react/sort-comp
    static renderSubjectLink(item, type, getHightlihghtedPos) {
        if (item.subjectType === 'user') {
            const {subjectUrl} = item;
            const username = item.subjects[0];
            const {start, length} = getHightlihghtedPos(type, username);
            return (
                <UserName key={username} url={subjectUrl} userName={username}>
                    <HighlightedText
                        className={block('subject-name')}
                        text={username}
                        start={start}
                        length={length}
                    />
                </UserName>
            );
        }

        if (item.subjectType === 'tvm') {
            const {subjectUrl} = item;
            const tvmId = item.subjects[0];
            const {name} = item.tvmInfo;
            const text = `${name} (${tvmId})`;
            const {start, length} = getHightlihghtedPos(type, text);
            return (
                <div className={block('subject-column')}>
                    <Link
                        key={name}
                        className={block('subject-link')}
                        url={subjectUrl}
                        theme="primary"
                        title={text}
                    >
                        <HighlightedText
                            className={block('subject-name')}
                            text={text}
                            start={start}
                            length={length}
                        />
                    </Link>
                    <Label text="TVM" />
                </div>
            );
        }

        const {name, url, group} = item.groupInfo || {};
        const {start, length} = getHightlihghtedPos(type, name);
        return (
            <Link key={name} url={url} theme="primary">
                <Tooltip
                    content={
                        group && (
                            <React.Fragment>
                                idm-group:{group}
                                <span className={block('copy-idm-group')}>
                                    <ClipboardButton text={`idm-group:${group}`} size={16} />
                                </span>
                            </React.Fragment>
                        )
                    }
                >
                    <HighlightedText
                        className={block('subject-name')}
                        text={name}
                        start={start}
                        length={length}
                    />
                </Tooltip>
            </Link>
        );
    }

    static hasFlags(item) {
        const {isUnrecognized, isRequested, isApproved, isDepriving} = item;
        return isUnrecognized || isRequested || isApproved || isDepriving;
    }

    static helpByFlags(item) {
        const {isRequested, isApproved, isDepriving} = item;
        if (isApproved) {
            return 'The role is approved and will be added';
        }
        if (isRequested) {
            return 'The role is pending approval';
        }
        if (isDepriving) {
            return 'The role will be removed';
        }
        return null;
    }

    static isMightBeRequested(idmKind, role) {
        const {
            permissions,
            //role_type: roleType
        } = role;
        // if (roleType === 'auditor' || roleType === 'read_approver' || roleType === 'responsible') {
        //     return true;
        // }
        const {permissionsToRequest} = PERMISSIONS_SETTINGS[idmKind] || {};
        return (permissionsToRequest || []).some((item) => _.isEqual(item, permissions));
    }

    state = {
        deleteItem: {},
    };

    componentDidMount() {
        const {path, idmKind, loadAclData} = this.props;

        if (path) {
            loadAclData({path, idmKind});
        }
    }

    componentDidUpdate(prevProps) {
        const {path, idmKind, loadAclData} = this.props;
        if (prevProps.path !== path) {
            loadAclData({path, idmKind});
        }
    }

    get templates() {
        const openDeleteModal = this.handleDeletePermissionClick;
        const {highlightedByFilter, idmKind, cluster} = this.props;
        const getSubjectHighlightedPos = highlightedByFilter['subjects'] || (() => false);
        const getColumnHighlightedPos = highlightedByFilter['columns'] || (() => false);

        return {
            subjects(item) {
                const {type, internal} = item;
                if (!internal) {
                    return ACL.renderSubjectLink(item, type, getSubjectHighlightedPos);
                }

                const nodes = _.map(item.subjects, (subject, index, arr) => {
                    const isGroup = item.types?.[index] === 'group';
                    const {start, length} = getSubjectHighlightedPos(type, subject);
                    const url = isGroup
                        ? `/${cluster}/groups?groupFilter=${subject}`
                        : `/${cluster}/users?filter=${subject}`;
                    return (
                        <Link key={index} theme={'primary'} routed url={url}>
                            <HighlightedText
                                key={subject}
                                text={subject}
                                className={block('subject-name')}
                                start={start}
                                length={length}
                                hasComa={index !== arr.length - 1}
                            />
                        </Link>
                    );
                });
                return <div className={block('subjects-list')}>{nodes}</div>;
            },
            inherited(item) {
                return item.inherited && <Icon awesome="level-down-alt" />;
            },
            permissions(item) {
                const action = item.action === 'deny' ? 'deny' : 'allow';
                const theme = action === 'deny' ? 'danger' : 'success';

                return (
                    <div className={block('permissions', {type: item.action})}>
                        <Label className={block('action-label')} theme={theme}>
                            {action}
                        </Label>
                        {renderText(item.permissions?.join(', '))}
                    </div>
                );
            },
            columns(item) {
                const columns = _.map(item.columns, (column, index, arr) => {
                    const {start, length} = getColumnHighlightedPos(column);
                    return (
                        <AclColumn
                            key={column}
                            column={column}
                            highlightStart={start}
                            highlightLength={length}
                            hasComa={index < arr.length - 1}
                        />
                    );
                });

                return columns;
            },
            inheritance_mode(item) {
                return renderText(hammer.format['ReadableField'](item.inheritance_mode));
            },
            actions(item) {
                return <RoleActions role={item} idmKind={idmKind} onDelete={openDeleteModal} />;
            },
            approve_type(item) {
                return hammer.format['Readable'](item.type);
            },
        };
    }

    get tableProps() {
        return {
            templates: this.templates,
            virtual: false,
            striped: false,
            cssHover: true,
            theme: 'light',
            css: block(),
            size: 'm',
        };
    }

    get objectTableProps() {
        const mode = 'objectDefault';

        return {
            ...this.tableProps,
            columns: {
                ...ACL.tableColumns,
                mode,
            },
        };
    }

    get columnsTableProps() {
        return {
            ...this.tableProps,
            columns: {
                ...ACL.tableColumns,
                mode: 'columns',
            },
        };
    }

    get approversTableProps() {
        return {
            ...this.tableProps,
            columns: {
                ...ACL.tableColumns,
                mode: 'approvers',
            },
        };
    }

    handleDeletePermissionClick = (deleteItem) => {
        const {handleShow} = this.props;
        this.setState({deleteItem}, handleShow);
    };

    handleCloseDeleteModal = () => {
        const {handleClose} = this.props;
        this.setState({deleteItem: {}}, handleClose);
    };

    renderSubjectsFilter() {
        return (
            <Filter
                placeholder="Filter by subject"
                onChange={this.onSubjectFilterChange}
                className={block('filter')}
                value={this.props.subjectFilter}
                size="m"
            />
        );
    }

    rowClassName(key, index) {
        const {
            highlightedByFilter: {[key]: isTransparent},
        } = this.props;
        return isTransparent(index) ? block('row-transparent') : null;
    }

    rowClassNameByFlags(item, mixin) {
        const {
            isUnrecognized: unrecognized,
            isDepriving: depriving,
            isRequested: requested,
            isApproved: approved,
        } = item;
        return block('row', {unrecognized, depriving, requested, approved}, mixin);
    }

    renderApprovers() {
        const {approvers} = this.props;
        return (
            approvers.length > 0 && (
                <ErrorBoundary>
                    <div className={block('approvers')}>
                        <div className="elements-heading elements-heading_size_xs">
                            Responsibles
                        </div>

                        <ElementsTable
                            {...this.approversTableProps}
                            items={approvers}
                            itemMods={this.approversRowClass}
                        />
                    </div>
                </ErrorBoundary>
            )
        );
    }

    approversRowClass = (item, index) => {
        const opacityClassName = this.rowClassName('approverRows', index);
        return this.rowClassNameByFlags(item, opacityClassName);
    };

    renderObjectPermissions() {
        const {objectPermissions} = this.props;
        return (
            <ErrorBoundary>
                <div className={block('object-permissions')}>
                    <div className="elements-heading elements-heading_size_xs">
                        Object Permissions
                    </div>

                    <ElementsTable
                        {...this.objectTableProps}
                        items={objectPermissions}
                        itemMods={this.permissionsRowClass}
                    />
                </div>
            </ErrorBoundary>
        );
    }

    renderColumnGroups() {
        const {columnGroups, idmKind, path, loadAclData, cluster, aclRequestOptions} = this.props;
        const {useEffective} = aclRequestOptions;
        const props = {
            path,
            loadAclDataFn: () => loadAclData({path, idmKind}),
            columnGroups,
            cluster,
        };
        return isIdmAclAvailable() && idmKind === IdmObjectType.PATH && !useEffective ? (
            <ColumnGroups {...props} />
        ) : null;
    }

    permissionsRowClass = (item, index) => {
        const opacityClassName = this.rowClassName('permissionRows', index);
        return this.rowClassNameByFlags(item, opacityClassName);
    };

    onSubjectFilterChange = (objectSubject) => {
        const {idmKind, changeObjectSubject} = this.props;
        changeObjectSubject({objectSubject, idmKind});
    };

    renderColumnsPermissions() {
        const {userPermissionsAccessColumns, columnsPermissions, columnsFilter} = this.props;

        return (
            userPermissionsAccessColumns.length > 0 && (
                <ErrorBoundary>
                    <div className={block('columns-permissions')}>
                        <div className="elements-heading elements-heading_size_xs">
                            Private columns permissions
                        </div>

                        <div className={block('filters-group')}>
                            <Filter
                                onChange={this.onFilterColumnPermissionsByColumn}
                                placeholder="Filter by columns"
                                className={block('filter')}
                                value={columnsFilter}
                                autofocus={false}
                                size="m"
                            />
                        </div>

                        <ElementsTable
                            {...this.columnsTableProps}
                            items={columnsPermissions}
                            itemMods={this.columnsRowClass}
                        />
                    </div>
                </ErrorBoundary>
            )
        );
    }

    columnsRowClass = (item, index) => {
        return this.rowClassName('columnRows', index);
    };

    onFilterColumnPermissionsByColumn = (columnsColumns) => {
        const {idmKind, changeColumnsColumns} = this.props;
        changeColumnsColumns({idmKind, columnsColumns});
    };

    deletePermissionsFn = (...args) => {
        const {deletePermissionsFn, loadAclData, idmKind, path} = this.props;
        return deletePermissionsFn(...args).then((d) => {
            loadAclData({path, idmKind});
            return d;
        });
    };

    renderContent() {
        const {
            disableAclInheritance,
            visible,
            bossApproval,
            disableInheritanceResponsible,
            path,
            idmKind,
            aclRequestOptions,
            version,
            userPermissions,
            userPermissionsRequestError,
            userPermissionsAccessColumns,
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
        } = this.props;
        const {deleteItem} = this.state;

        return (
            <Fragment>
                {this.renderFlags()}
                {this.renderSubjectsFilter()}
                {this.renderApprovers()}
                {this.renderObjectPermissions()}
                {this.renderColumnGroups()}
                {this.renderColumnsPermissions()}

                {loaded && (
                    <UserPermissions
                        cluster={cluster}
                        className={block('user-permissions')}
                        path={path}
                        idmKind={idmKind}
                        aclRequestOptions={aclRequestOptions}
                        version={version}
                        accessColumns={userPermissionsAccessColumns}
                        permissions={userPermissions}
                        requestPermissions={userPermissionsRequestFn}
                        requestPermissionsError={userPermissionsRequestError}
                        cancelRequestPermissions={userPermissionsCancelRequestFn}
                        loadAclData={loadAclData}
                        loading={loading}
                        loaded={loaded}
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
                    />
                )}

                <DeletePermissionModal
                    idmKind={idmKind}
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

    renderFlags() {
        const {idmKind, disableAclInheritance, bossApproval, disableInheritanceResponsible} =
            this.props;
        const {allowBossApprovals, allowInheritAcl, allowInheritResponsibles} =
            PERMISSIONS_SETTINGS[idmKind];

        const {inherited: bossApprovalInherited} = bossApproval || {};
        const {inherited: aclInherited} = disableAclInheritance || {};

        const items = [
            allowInheritAcl && [
                {
                    icon: Boolean(aclInherited) && (
                        <Icon className={block('flag-icon')} awesome={'level-down-alt'} />
                    ),
                    key: 'inherit ACL',
                    value: <FlagRole role={disableAclInheritance} invert />,
                },
            ],
            isIdmAclAvailable() &&
                allowBossApprovals && [
                    {
                        icon: Boolean(bossApprovalInherited) && (
                            <Icon className={block('flag-icon')} awesome={'level-down-alt'} />
                        ),
                        key: 'boss approval',
                        value: <FlagRole role={bossApproval} />,
                    },
                ],
            isIdmAclAvailable() &&
                allowInheritResponsibles && [
                    {
                        key: 'inherit responsibles',
                        value: <FlagRole role={disableInheritanceResponsible} invert />,
                    },
                ],
        ].filter(Boolean);

        if (!items.length) {
            return null;
        }

        return <MetaTable className={block('meta')} items={items} />;
    }

    render() {
        const {loading, loaded} = this.props;
        const initialLoading = loading && !loaded;

        return (
            <ErrorBoundary>
                <LoadDataHandler {...this.props}>
                    <div className={block({loading: initialLoading})}>
                        {initialLoading ? <Loader /> : this.renderContent()}
                    </div>
                </LoadDataHandler>
            </ErrorBoundary>
        );
    }
}

export default withVisible(ACL);
