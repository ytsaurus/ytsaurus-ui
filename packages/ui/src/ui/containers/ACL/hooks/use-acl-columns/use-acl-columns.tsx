import {type Column} from '@gravity-ui/react-data-table';
import {Flex, Icon} from '@gravity-ui/uikit';
import {ClipboardButton, Tooltip} from '@ytsaurus/components';
import cn from 'bem-cn-lite';
import React from 'react';
import aclInheritedSvg from '../../../../assets/img/svg/acl-inherited.svg';
import format from '../../../../common/hammer/format';
import {ExpandButton} from '../../../../components/ExpandButton/ExpandButton';
import Label from '../../../../components/Label';
import {SubjectCard} from '../../../../components/SubjectLink/SubjectLink';
import {useMemoizedIfEqual} from '../../../../hooks';
import UIFactory, {type AclRoleActionsType} from '../../../../UIFactory';
import {type ApproverRow, type PermissionsRow} from '../../ACL-types';
import {AclColumnsCell} from '../../AclColumnsCell';
import i18nPermissionValues from '../../i18n-permission-values';
import {InheritanceMessage} from '../../InheritanceMessage/InheritanceMessage';
import i18n from './i18n';
import './use-acl-columns.scss';

const block = cn('yt-acl-columns');

export function useAclColumns<T extends ApproverRow | PermissionsRow>(
    names: ReadonlyArray<AclColumnName>,
    params: UseAclColumnParams,
) {
    const [paramsMemo, namesMemo] = useMemoizedIfEqual(params, names);

    return React.useMemo(() => {
        return getAclColumns<T>(namesMemo, paramsMemo);
    }, [paramsMemo, namesMemo]);
}

export type UseAclColumnParams = {
    renderRoleActions: (params: {row: AclRoleActionsType}) => React.ReactNode;
    hasInherited?: boolean;
    onExpandAclSubject?: (item?: string | number) => void;
};

export function getAclColumns<T extends ApproverRow | PermissionsRow>(
    names: ReadonlyArray<AclColumnName>,
    params: UseAclColumnParams,
) {
    const availableColumns = getColumnsTemplates<T>(params);
    return names.map((name) => availableColumns[name]);
}

export type AclColumnName = keyof ReturnType<typeof getColumnsTemplates>;

function getColumnsTemplates<T extends ApproverRow | PermissionsRow>({
    renderRoleActions,
    hasInherited,
    onExpandAclSubject,
}: UseAclColumnParams) {
    return {
        expand: {
            name: '',
            align: 'right',
            className: block('table-item', {type: 'expand'}),
            render({row}) {
                if (!onExpandAclSubject) {
                    return null;
                }

                const expanded = 'expanded' in row ? row.expanded : undefined;
                return expanded === undefined ? null : (
                    <ExpandButton
                        inline
                        expanded={expanded}
                        toggleExpanded={() => {
                            onExpandAclSubject(row.subjects[0]);
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
                            {renderSubjectLink(row)}
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
                            {i18nPermissionValues(`action_${action}`)}
                        </Label>
                        <AclColumnsCell
                            withQoutes
                            items={row.permissions?.map((item) =>
                                i18nPermissionValues(`value_${item}`),
                            )}
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
                    ? format.NO_VALUE
                    : i18nPermissionValues(`inheritance_mode_${mode}`);
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
                return renderRoleActions({row});
            },
        } as Column<T>,
        approve_type: {
            name: i18n('field_type'),
            align: 'left',
            className: block('table-item', {type: 'approve-type'}),
            render({row}) {
                return format['Readable'](row.type);
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

function renderSubjectLink(item: ApproverRow | PermissionsRow) {
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
