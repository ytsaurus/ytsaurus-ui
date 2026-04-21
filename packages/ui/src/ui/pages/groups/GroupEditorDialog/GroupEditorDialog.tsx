import {
    type EditableManyListsItemType,
    type FormApi,
    YTDFDialog,
    extractChangedSubjects,
    prepareRoleListValue,
} from '../../../components/Dialog';
import React from 'react';
import cn from 'bem-cn-lite';
import {type ConnectedProps, connect} from 'react-redux';

import i18n from './i18n';

import {closeGroupEditorModal, fetchGroups, saveGroupData} from '../../../store/actions/groups';
import {
    getGroupEditorGroupIdm,
    getGroupEditorGroupName,
    getGroupEditorIdmDataOtherMembers,
    getGroupEditorRoles,
    getGroupEditorVisible,
} from '../../../store/selectors/groups';
import {type RootState} from '../../../store/reducers';
import {type ResponsibleType, type RoleConverted} from '../../../utils/acl/acl-types';
import UIFactory from '../../../UIFactory';
import {disableGroupsCache} from '../../../utils/users-groups';

import './GroupEditorDialog.scss';

const block = cn('group-editor-dialog');

interface GroupsPageTableProps extends ConnectedProps<typeof connector> {}

type FormValues = {
    general: {
        groupName: string;
        idm: string;
        size: string;
    };
    members: {
        members: {
            current: EditableManyListsItemType<RoleConverted>;
            newItems: Array<ResponsibleType>;
        };
        membersComment?: string;
    };
    responsibles: {
        responsibles: {
            current: EditableManyListsItemType<RoleConverted>;
            newItems: Array<ResponsibleType>;
        };
        responsiblesComment?: string;
    };
};

class GroupEditorDialog extends React.Component<GroupsPageTableProps> {
    onSubmit = async (form: FormApi<FormValues, Partial<FormValues>>) => {
        const {groupName: initialGroupName} = this.props;
        const {values} = form.getState();
        const {members, membersComment} = values.members;
        const {added: membersToAdd, removed: membersToRemove} = extractChangedSubjects(members);

        const {responsibles, responsiblesComment} = values.responsibles;
        const {added: responsiblesToAdd, removed: responsiblesToRemove} =
            extractChangedSubjects(responsibles);

        const {groupName} = values.general;

        let comment = '';
        if (membersComment) {
            comment += responsiblesComment ? '**COMMENT FOR MEMBERS**\n' : '';
            comment += `${membersComment}\n\n`;
        }
        if (responsiblesComment) {
            comment += membersComment ? '**COMMENT FOR RESPONSIBLES**\n' : '';
            comment += `${responsiblesComment}`;
        }

        return this.props
            .saveGroupData({
                initialGroupName,
                groupName,
                membersToAdd,
                membersToRemove,
                responsiblesToAdd,
                responsiblesToRemove,
                comment,
            })
            .then(() => {
                disableGroupsCache();
                return this.props.fetchGroups();
            })
            .then(() => {});
    };

    render() {
        const {visible, closeGroupEditorModal, groupName, idm, members, otherMembers, responsible} =
            this.props;
        return (
            <YTDFDialog<FormValues>
                size={'l'}
                className={block(null)}
                pristineSubmittable={false}
                visible={visible}
                headerProps={{
                    title: this.isNewGroup()
                        ? i18n('title_create-group')
                        : i18n('title_group', {groupName}),
                }}
                onClose={closeGroupEditorModal}
                onAdd={this.onSubmit}
                initialValues={{
                    general: {
                        groupName,
                        idm: String(idm || '-'),
                        size: String(members.length),
                    },
                    responsibles: {
                        responsibles: prepareRoleListValue(responsible),
                    },
                    members: {
                        members: prepareRoleListValue(members, otherMembers),
                    },
                }}
                fields={[
                    ...[
                        {
                            type: 'tab-vertical' as const,
                            name: 'general',
                            title: i18n('title_general'),
                            fields: [
                                {
                                    name: 'groupName',
                                    type: UIFactory.getAclApi().groups.allowRename
                                        ? ('text' as const)
                                        : ('plain' as const),
                                    required: true,
                                    caption: i18n('field_group-name'),
                                },
                                ...(UIFactory.getAclApi().getGroupAcl
                                    ? [
                                          {
                                              name: 'idm',
                                              type: 'plain' as const,
                                              caption: i18n('field_idm-managed'),
                                          },
                                      ]
                                    : []),

                                {
                                    name: 'size',
                                    type: 'plain' as const,
                                    caption: i18n('field_size'),
                                },
                            ],
                        },
                        ...(UIFactory.getAclApi().getGroupAcl
                            ? [
                                  {
                                      type: 'tab-vertical' as const,
                                      name: 'responsibles',
                                      title: i18n('title_responsibles'),
                                      fields: [
                                          {
                                              name: 'responsibles',
                                              type: 'acl-roles' as const,
                                              caption: i18n('field_responsibles'),
                                              extras: {
                                                  placeholder: i18n('context_enter-login-or-name'),
                                              },
                                          },
                                          {
                                              name: 'responsiblesComment',
                                              type: 'textarea' as const,
                                              caption: i18n('field_comment-for-idm'),
                                          },
                                      ],
                                  },
                              ]
                            : []),
                    ],
                    {
                        type: 'tab-vertical',
                        name: 'members',
                        title: i18n('title_members'),
                        fields: [
                            {
                                name: 'members',
                                type: 'acl-roles',
                                caption: i18n('field_members'),
                                extras: {
                                    placeholder: i18n('context_enter-login-or-name'),
                                },
                            },

                            ...(UIFactory.getAclApi().updateGroup
                                ? [
                                      {
                                          name: 'membersComment',
                                          type: 'textarea' as const,
                                          caption: i18n('field_comment-for-idm'),
                                      },
                                  ]
                                : []),
                        ],
                    },
                ]}
            />
        );
    }

    private isNewGroup() {
        return !this.props.groupName;
    }
}

const mapStateToProps = (state: RootState) => {
    const otherMembers = getGroupEditorIdmDataOtherMembers(state);
    const {responsible, members} = getGroupEditorRoles(state);
    return {
        visible: getGroupEditorVisible(state),
        groupName: getGroupEditorGroupName(state),
        idm: getGroupEditorGroupIdm(state),
        members,
        responsible,
        otherMembers,
    };
};

const mapDispatchToProps = {
    closeGroupEditorModal,
    saveGroupData,
    fetchGroups,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export default connector(GroupEditorDialog);
