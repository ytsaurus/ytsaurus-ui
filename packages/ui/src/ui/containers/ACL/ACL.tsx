import {Column} from '@gravity-ui/react-data-table';
import {ClipboardButton, Flex, Icon, Loader} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import compact_ from 'lodash/compact';
import React, {Component, Fragment} from 'react';
import aclInheritedSvg from '../../assets/img/svg/acl-inherited.svg';
import hammer from '../../common/hammer';
import ErrorBoundary from '../../components/ErrorBoundary/ErrorBoundary';
import {ExpandButton} from '../../components/ExpandButton';
import Label from '../../components/Label';
import LoadDataHandler from '../../components/LoadDataHandler/LoadDataHandler';
import {SegmentControl, SegmentControlItem} from '../../components/SegmentControl/SegmentControl';
import {SubjectCard} from '../../components/SubjectLink/SubjectLink';
import {renderText} from '../../components/templates/utils';
import {Tooltip} from '@ytsaurus/components';
import {DataTableYT} from '../../components/DataTableYT';
import WithStickyToolbar from '../../components/WithStickyToolbar/WithStickyToolbar';
import {isIdmAclAvailable} from '../../config';
import {AclMode, IdmObjectType} from '../../constants/acl';
import withVisible, {WithVisibleProps} from '../../hocs/withVisible';
import {ObjectPermissionRowWithExpand, PreparedApprover} from '../../store/selectors/acl';
import UIFactory, {AclRoleActionsType} from '../../UIFactory';
import {PreparedRole, isGranted} from '../../utils/acl';
import {PreparedAclSubject} from '../../utils/acl/acl-types';
import {ACLReduxProps} from './ACL-connect-helpers';
import './ACL.scss';
import i18n from './i18n';
import {AclActions} from './AclActions/AclActions';
import {AclColumnsCell} from './AclColumnsCell';
import {AclModeControl} from './AclModeControl';
import ApproversFilters from './ApproversFilters/ApproversFilters';
import ColumnGroups from './ColumnGroups/ColumnGroups';
import DeletePermissionModal from './DeletePermissionModal/DeletePermissionModal';
import {InheritanceMessage} from './InheritanceMessage/InheritanceMessage';
import {MyPermissions} from './MyPermissinos/MyPermissions';
import ObjectPermissionsFilters from './ObjectPermissionsFilters/ObjectPermissionsFilters';
import {RowGroups} from './RowGroups/RowGroups';

const block = cn('navigation-acl');

type Props = ACLReduxProps & WithVisibleProps & {className?: string};

type ApproverRow = PreparedApprover & {
    aggregated_row_access_predicates?: Array<string>;
    expanded?: boolean;
};
type PermissionsRow = ObjectPermissionRowWithExpand & {
    aggregated_row_access_predicates?: Array<string>;
    expanded?: boolean;
};

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

    // eslint-disable-next-line react/sort-comp
    static renderSubjectLink(item: PreparedAclSubject | PreparedApprover | PermissionsRow) {
        const {internal} = item;
        if (internal) {
            const [subject] = item.subjects;
            const [type] = item.types ?? [];
            return (
                <SubjectCard
                    name={subject!}
                    type={type === 'group' ? 'group' : 'user'}
                    internal
                    showIcon
                />
            );
        }

        if (item.subjectType === 'user') {
            const {subjectUrl} = item;
            const username = item.subjects[0];
            return <SubjectCard url={subjectUrl} name={username as string} showIcon />;
        }

        if (item.subjectType === 'tvm') {
            const tvmId = item.subjects[0];
            const {name} = item.tvmInfo ?? {};

            const text = `${name} (${tvmId})`;
            return (
                <div className={block('subject-with-tvm')}>
                    <SubjectCard url={item.subjectUrl} name={text} type="tvm" showIcon />
                    <Label text="TVM" />
                </div>
            );
        }

        const {name, url, group} = item.groupInfo || {};
        const {group_type} = item;
        return (
            <Tooltip
                content={
                    group && (
                        <React.Fragment>
                            idm-group:{group}
                            <span className={block('copy-idm-group')}>
                                <ClipboardButton text={`idm-group:${group}`} size="s" />
                            </span>
                        </React.Fragment>
                    )
                }
            >
                <SubjectCard
                    name={name ?? group!}
                    url={url}
                    type="group"
                    groupType={group_type}
                    showIcon
                />
            </Tooltip>
        );
    }

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

    getColumnsTemplates<T extends ApproverRow | PermissionsRow>({
        hasInherited,
        mode,
    }: {
        hasInherited?: boolean;
        mode: 'responsible' | 'permissions';
    }) {
        const openDeleteModal = this.handleDeletePermissionClick;
        const {idmKind, toggleExpandAclSubject} = this.props;
        return {
            expand: {
                name: '',
                align: 'right',
                className: block('table-item', {type: 'expand'}),
                render({row}) {
                    const expanded = 'expanded' in row ? row.expanded : undefined;
                    return expanded === undefined ? null : (
                        <ExpandButton
                            inline
                            expanded={expanded}
                            toggleExpanded={() => {
                                toggleExpandAclSubject(row.subjects[0]);
                            }}
                            qa="acl-expand"
                        />
                    );
                },
                width: 36,
            } as Column<T>,
            subjects: {
                name: i18n('field_subjects'),
                align: 'left',
                className: block('table-item', {type: 'subjects'}),
                render({row}) {
                    const {requestPermissionsFlags = {}} = UIFactory.getAclApi();

                    const {inheritedFrom} = row;

                    const level = 'level' in row ? row.level : undefined;
                    return (
                        <Flex className={block('subject', {level: String(level)})} wrap gap={1}>
                            {Boolean(hasInherited) && (
                                <Tooltip
                                    content={<InheritanceMessage data={inheritedFrom} />}
                                    placement={['top-start']}
                                >
                                    <div className={block('inherited', {hidden: !row.inherited})}>
                                        <Icon
                                            className={block('inherited-icon')}
                                            data={aclInheritedSvg}
                                            size={16}
                                        />
                                    </div>
                                </Tooltip>
                            )}
                            <Flex grow wrap gap={1}>
                                {ACL.renderSubjectLink(row)}
                            </Flex>
                            {Object.keys(requestPermissionsFlags).map((key, index) => {
                                const flagInfo = requestPermissionsFlags[key];
                                return (
                                    <React.Fragment key={index}>
                                        {flagInfo.renderIcon(row)}
                                    </React.Fragment>
                                );
                            })}
                        </Flex>
                    );
                },
            } as Column<T>,
            permissions: {
                name: i18n('field_permissions'),
                align: 'left',
                className: block('table-item', {type: 'permissions'}),
                render({row}) {
                    const action = row.action === 'deny' ? 'deny' : 'allow';
                    const theme = action === 'deny' ? 'danger' : 'success';

                    return (
                        <div className={block('permissions', {type: row.action})}>
                            <Label className={block('action-label')} theme={theme}>
                                {action}
                            </Label>
                            <AclColumnsCell
                                withQoutes
                                items={row.permissions?.map(hammer.format.Readable)}
                                expanadable={'expanded' in row}
                            />
                        </div>
                    );
                },
            } as Column<T>,
            inheritance_mode: {
                name: i18n('field_inheritance-mode'),
                render({row}) {
                    const {inheritance_mode: mode} = row;
                    return mode === undefined
                        ? hammer.format.NO_VALUE
                        : renderText(hammer.format['ReadableField'](mode));
                },
                align: 'left',
                className: block('table-item', {type: 'inheritance-mode'}),
            } as Column<T>,
            actions: {
                name: 'actions',
                header: '',
                align: 'right',
                className: block('table-item', {type: 'actions'}),
                render({row}) {
                    const expanded = 'expanded' in row ? row.expanded : undefined;
                    const RoleActions = UIFactory.getComponentForAclRoleActions();
                    return expanded !== undefined
                        ? null
                        : RoleActions !== undefined && (
                              <RoleActions
                                  mode={mode}
                                  role={row}
                                  idmKind={idmKind}
                                  onDelete={openDeleteModal}
                              />
                          );
                },
            } as Column<T>,
            approve_type: {
                name: i18n('field_type'),
                align: 'left',
                className: block('table-item', {type: 'approve-type'}),
                render({row}) {
                    return hammer.format['Readable'](row.type);
                },
            } as Column<T>,
            columns: {
                name: i18n('field_private-columns'),
                align: 'left',
                className: block('table-item', {type: 'columns'}),
                render({row}) {
                    return <AclColumnsCell items={row.columns} expanadable={'expanded' in row} />;
                },
            } as Column<T>,
            row_access_predicate: {
                name: i18n('field_row-access-predicate'),
                align: 'left',
                className: block('table-item', {type: 'row-access-predicate'}),
                render({row}) {
                    const expandable = 'expanded' in row;
                    const {row_access_predicate, aggregated_row_access_predicates} = row;
                    return (
                        <AclColumnsCell
                            items={
                                expandable
                                    ? aggregated_row_access_predicates
                                    : row_access_predicate
                                      ? [row_access_predicate]
                                      : []
                            }
                            expanadable={expandable}
                        />
                    );
                },
            } as Column<T>,
        };
    }

    handleDeletePermissionClick = (deleteItem: AclRoleActionsType) => {
        const {handleShow} = this.props;
        this.setState({deleteItem}, handleShow);
    };

    handleCloseDeleteModal = () => {
        const {handleClose} = this.props;
        this.setState({deleteItem: {}}, handleClose);
    };

    rowClassNameByFlags<T extends ApproverRow | PermissionsRow>(item: T) {
        const {
            isUnrecognized: unrecognized,
            isDepriving: depriving,
            isRequested: requested,
            isApproved: approved,
            isMissing: missing,
        } = item;
        return block('row', {
            unrecognized: unrecognized || missing,
            depriving,
            requested,
            approved,
        });
    }

    renderApprovers() {
        const {hasApprovers, approversFiltered, loaded} = this.props;
        const tableColumns = (['subjects', 'approve_type', 'actions'] as const).map(
            (name) =>
                this.getColumnsTemplates<ApproverRow>({hasInherited: true, mode: 'responsible'})[
                    name
                ],
        );
        return (
            hasApprovers && (
                <ErrorBoundary>
                    <div className={block('approvers')}>
                        <div className="elements-heading elements-heading_size_xs">
                            {i18n('title_responsibles')}
                        </div>
                        <WithStickyToolbar
                            topMargin="none"
                            toolbar={<ApproversFilters />}
                            bottomMargin="regular"
                            content={
                                <DataTableYT
                                    data={approversFiltered}
                                    loaded={loaded}
                                    noItemsText={i18n('alert_no-responsibles')}
                                    columns={tableColumns}
                                    theme={'yt-borderless'}
                                    rowClassName={this.rowClassNameByFlags}
                                    settings={{
                                        sortable: false,
                                        displayIndices: false,
                                    }}
                                />
                            }
                        />
                    </div>
                </ErrorBoundary>
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
        const {
            aclMode,
            loaded,
            loading,
            idmKind,
            columnsFilter,
            updateAclFilters,
            userPermissionsAccessColumns,
        } = this.props;

        const {
            title,
            columns,
            data: {hasInherited, items},
            noItemsText,
        } = this.getObjectPermissionsDetails();

        const tableColumns: Array<Column<PermissionsRow>> = columns.map(
            (name) =>
                this.getColumnsTemplates<PermissionsRow>({hasInherited, mode: 'permissions'})[name],
        );

        return (
            <ErrorBoundary>
                <div className={block('object-permissions')}>
                    <div className="elements-heading elements-heading_size_xs">{title}</div>
                    <WithStickyToolbar
                        topMargin="none"
                        bottomMargin="regular"
                        toolbar={
                            <ObjectPermissionsFilters
                                {...{
                                    aclMode,
                                    idmKind,
                                    columnsFilter,
                                    updateAclFilters,
                                    userPermissionsAccessColumns,
                                }}
                            />
                        }
                        content={
                            <DataTableYT
                                noItemsText={noItemsText}
                                data={items}
                                loading={loading}
                                loaded={loaded}
                                columns={tableColumns}
                                theme={'yt-borderless'}
                                rowClassName={this.rowClassNameByFlags}
                                settings={{
                                    sortable: false,
                                    displayIndices: false,
                                }}
                            />
                        }
                    />
                </div>
            </ErrorBoundary>
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
