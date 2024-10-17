import React, {Component, Fragment} from 'react';
import hammer from '../../common/hammer';
import cn from 'bem-cn-lite';

import compact_ from 'lodash/compact';

import {Button, ClipboardButton, Flex, Icon, Loader, Popover} from '@gravity-ui/uikit';
import {Column} from '@gravity-ui/react-data-table';

import {AclMode, IdmObjectType} from '../../constants/acl';

import ColumnGroups from './ColumnGroups/ColumnGroups';

import DeletePermissionModal from './DeletePermissionModal/DeletePermissionModal';
import {AclActions} from './AclActions/AclActions';
import {MyPermissions} from './MyPermissinos/MyPermissions';

import LoadDataHandler from '../../components/LoadDataHandler/LoadDataHandler';
import ErrorBoundary from '../../components/ErrorBoundary/ErrorBoundary';
import DataTableYT from '../../components/DataTableYT/DataTableYT';
import {Tooltip} from '../../components/Tooltip/Tooltip';
import {SubjectCard} from '../../components/SubjectLink/SubjectLink';

import withVisible, {WithVisibleProps} from '../../hocs/withVisible';
import {renderText} from '../../components/templates/utils';
import Label from '../../components/Label/Label';
import {isIdmAclAvailable} from '../../config';
import ApproversFilters from './ApproversFilters/ApproversFilters';
import ObjectPermissionsFilters from './ObjectPermissionsFilters/ObjectPermissionsFilters';
import UIFactory, {AclRoleActionsType} from '../../UIFactory';

import {ACLReduxProps} from './ACL-connect-helpers';
import {PreparedAclSubject} from '../../utils/acl/acl-types';
import {ObjectPermissionRowWithExpand, PreparedApprover} from '../../store/selectors/acl';

import {SegmentControl, SegmentControlItem} from '../../components/SegmentControl/SegmentControl';
import WithStickyToolbar from '../../components/WithStickyToolbar/WithStickyToolbar';
import {PreparedRole} from '../../utils/acl';
import {AclModeControl} from './AclModeControl';
import {ExpandButton} from '../../components/ExpandButton';
import {AclColumnsCell} from './AclColumnsCell';

import aclInheritedSvg from '../../assets/img/svg/acl-inherited.svg';

import './ACL.scss';
import {InheritanceMessage} from './InheritanceMessage/InheritanceMessage';

const block = cn('navigation-acl');

type Props = ACLReduxProps & WithVisibleProps & {className?: string};

type ApproverRow = PreparedApprover;
type PermissionsRow = ObjectPermissionRowWithExpand;

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
    }: {hasInherited?: boolean} = {}) {
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
                        />
                    );
                },
                width: 36,
            } as Column<T>,
            subjects: {
                name: 'Subjects',
                align: 'left',
                className: block('table-item', {type: 'subjects'}),
                render({row}) {
                    const {requestPermissionsFlags = {}} = UIFactory.getAclApi();

                    const {inheritedFrom} = row;

                    const level = 'level' in row ? row.level : undefined;
                    return (
                        <Flex className={block('subject', {level: String(level)})} wrap gap={1}>
                            {Boolean(hasInherited) && (
                                <Popover
                                    className={block('inherited', {hidden: !row.inherited})}
                                    content={<InheritanceMessage data={inheritedFrom} />}
                                >
                                    <Icon
                                        className={block('inherited-icon')}
                                        data={aclInheritedSvg}
                                        size={16}
                                    />
                                </Popover>
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
                name: 'Permissions',
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
                                items={row.permissions?.map(hammer.format.Readable)}
                                expanadable={'expanded' in row}
                            />
                        </div>
                    );
                },
            } as Column<T>,
            inheritance_mode: {
                name: 'Inheritance mode',
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
                    const level = 'level' in row ? row.level : undefined;
                    const RoleActions = UIFactory.getComponentForAclRoleActions();
                    return level === 0
                        ? null
                        : RoleActions !== undefined && (
                              <RoleActions
                                  role={row}
                                  idmKind={idmKind}
                                  onDelete={openDeleteModal}
                              />
                          );
                },
            } as Column<T>,
            approve_type: {
                name: 'Type',
                align: 'left',
                className: block('table-item', {type: 'approve-type'}),
                render({row}) {
                    return hammer.format['Readable'](row.type);
                },
            } as Column<T>,
            columns: {
                name: 'Private columns',
                align: 'left',
                className: block('table-item', {type: 'columns'}),
                render({row}) {
                    return <AclColumnsCell items={row.columns} expanadable={'expanded' in row} />;
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
            (name) => this.getColumnsTemplates<ApproverRow>({hasInherited: true})[name],
        );
        return (
            hasApprovers && (
                <ErrorBoundary>
                    <div className={block('approvers')}>
                        <div className="elements-heading elements-heading_size_xs">
                            Responsibles
                            <Button className={block('sync-with-col-groups')}>
                                Hidden button to sync offsets with column groups
                            </Button>
                        </div>
                        <WithStickyToolbar
                            padding="skip-vertical"
                            toolbar={<ApproversFilters />}
                            bottomMargin="regular"
                            content={
                                <DataTableYT
                                    data={approversFiltered}
                                    loaded={loaded}
                                    noItemsText="Thre are no any responsibles"
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

    renderObjectPermissions() {
        const {
            aclMode,
            loaded,
            loading,
            mainPermissions,
            columnsPermissions,
            idmKind,
            columnsFilter,
            updateAclFilters,
            userPermissionsAccessColumns,
        } = this.props;
        const useColumns = aclMode === AclMode.COLUMN_GROUPS_PERMISSISONS;

        const {items, hasDenyAction, hasExpandable, hasInherited} = useColumns
            ? columnsPermissions
            : mainPermissions;
        const extraColumns = useColumns
            ? ([...(hasDenyAction ? ['permissions' as const] : []), 'columns'] as const)
            : (['permissions'] as const);

        const tableColumns: Array<Column<PermissionsRow>> = (
            [
                ...(hasExpandable ? ['expand' as const] : []),
                'subjects',
                ...extraColumns,
                'inheritance_mode',
                'actions',
            ] as const
        ).map((name) => this.getColumnsTemplates<PermissionsRow>({hasInherited})[name]);

        return (
            <ErrorBoundary>
                <div className={block('object-permissions')}>
                    <div className="elements-heading elements-heading_size_xs">
                        {useColumns ? 'Private columns permissions' : 'Object permissions'}
                    </div>
                    <WithStickyToolbar
                        padding="skip-vertical"
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
                                noItemsText={
                                    aclMode === AclMode.COLUMN_GROUPS_PERMISSISONS
                                        ? 'There are no any column group permissions'
                                        : 'There are no any object permissions'
                                }
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
        const props = {
            path,
            loadAclDataFn: () => loadAclData({path, idmKind}),
            columnGroups,
            cluster,
            allowEdit: nodeType === 'map_node',
            updateAclFilters,
            columnsFilter,
            columnGroupNameFilter,
            userPermissionsAccessColumns,
        };
        return isIdmAclAvailable() && idmKind === IdmObjectType.PATH ? (
            <ColumnGroups loaded={loaded} {...props} />
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
            aclMode,
            updateAclFilters,
        } = this.props;
        const {deleteItem} = this.state;

        const hasColumns = Boolean(aclMode);
        const useColumns = aclMode === AclMode.COLUMN_GROUPS_PERMISSISONS;

        return (
            <Fragment>
                <Flex className={block('toolbar', {'has-columns': hasColumns})}>
                    {hasColumns && (
                        <Flex grow>
                            <AclModeControl {...{aclMode, updateAclFilters}} />
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
                            aclMode={aclMode}
                        />
                    )}
                </Flex>
                {this.renderMeta()}

                {useColumns ? this.renderColumnGroups() : this.renderApprovers()}
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

    renderMeta() {
        const {
            idmKind,
            disableAclInheritance,
            bossApproval,
            disableInheritanceResponsible,
            userPermissions,
        } = this.props;
        const {allowBossApprovals, allowInheritAcl, allowInheritResponsibles} =
            UIFactory.getAclPermissionsSettings()[idmKind];

        function toSegmentItem(name: string, role?: boolean | PreparedRole, invert?: boolean) {
            return {
                name,
                value: invert ? !role : Boolean(role),
                url: 'boolean' === typeof role ? undefined : role?.idmLink,
            };
        }

        const segments: Array<SegmentControlItem> = compact_([
            allowInheritAcl && toSegmentItem('Inherit ACL', disableAclInheritance, true),
            isIdmAclAvailable() &&
                allowBossApprovals &&
                toSegmentItem('Boss approval', bossApproval),
            isIdmAclAvailable() &&
                allowInheritResponsibles &&
                toSegmentItem('Inherit responsibles', disableInheritanceResponsible, true),
        ]);

        const {mainPermissions, columnsPermissions, approversFiltered, columnGroups, aclMode} =
            this.props;

        const counters: Array<SegmentControlItem> =
            aclMode === AclMode.COLUMN_GROUPS_PERMISSISONS
                ? [
                      {name: 'Column groups', value: columnGroups.length},
                      {name: 'Column permissions', value: columnsPermissions.count},
                  ]
                : [
                      {name: 'Responsibles', value: approversFiltered.length},
                      {name: 'Object permissions', value: mainPermissions.count},
                  ];

        return (
            <Flex className={block('meta')} wrap alignItems="center">
                <SegmentControl
                    className={block('meta-overview')}
                    background="neutral-light"
                    groups={[segments, counters].filter(({length}) => length > 0)}
                />
                {aclMode !== AclMode.COLUMN_GROUPS_PERMISSISONS && (
                    <MyPermissions userPermissions={userPermissions} />
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
