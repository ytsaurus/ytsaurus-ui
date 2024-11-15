import {
    EditableManyListsItemType,
    FormApi,
    YTDFDialog,
    extractChangedSubjects,
    prepareRoleListValue,
} from '../../../components/Dialog';
import React from 'react';
import cn from 'bem-cn-lite';
import {ConnectedProps, connect} from 'react-redux';

import {closeGroupEditorModal, saveGroupData} from '../../../store/actions/groups';
import {
    getGroupEditorGroupIdm,
    getGroupEditorGroupName,
    getGroupEditorIdmDataOtherMembers,
    getGroupEditorRoles,
    getGroupEditorVisible,
} from '../../../store/selectors/groups';
import type {RootState} from '../../../store/reducers';
import type {ResponsibleType, RoleConverted} from '../../../utils/acl/acl-types';

import './GroupEditorDialog.scss';

const block = cn('group-editor-dialog');

interface GroupsPageTableProps extends ConnectedProps<typeof connector> {}

type FormValues = {
    details: {
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
    onSubmit = (form: FormApi<FormValues, Partial<FormValues>>) => {
        const {groupName, saveGroupData} = this.props;
        const {values} = form.getState();
        const {members, membersComment} = values.members;
        const {added: membersToAdd, removed: membersToRemove} = extractChangedSubjects(members);

        const {responsibles, responsiblesComment} = values.responsibles;
        const {added: responsiblesToAdd, removed: responsiblesToRemove} =
            extractChangedSubjects(responsibles);

        let comment = '';
        if (membersComment) {
            comment += responsiblesComment ? '**COMMENT FOR MEMBERS**\n' : '';
            comment += `${membersComment}\n\n`;
        }
        if (responsiblesComment) {
            comment += membersComment ? '**COMMENT FOR RESPONSIBLES**\n' : '';
            comment += `${responsiblesComment}`;
        }

        return saveGroupData(
            groupName,
            membersToAdd,
            membersToRemove,
            responsiblesToAdd,
            responsiblesToRemove,
            comment,
        ).then(() => {});
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
                    title: groupName,
                }}
                onClose={closeGroupEditorModal}
                onAdd={this.onSubmit}
                initialValues={{
                    details: {
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
                    {
                        type: 'tab-vertical',
                        name: 'details',
                        title: 'Details',
                        fields: [
                            {
                                name: 'idm',
                                type: 'plain',
                                caption: 'Idm managed',
                            },
                            {
                                name: 'size',
                                type: 'plain',
                                caption: 'Size',
                            },
                        ],
                    },
                    {
                        type: 'tab-vertical',
                        name: 'responsibles',
                        title: 'Responsibles',
                        fields: [
                            {
                                name: 'responsibles',
                                type: 'acl-roles',
                                caption: 'Responsibles',
                                extras: {
                                    placeholder: 'Enter login or name',
                                },
                            },
                            {
                                name: 'responsiblesComment',
                                type: 'textarea',
                                caption: 'Comment for IDM',
                            },
                        ],
                    },
                    {
                        type: 'tab-vertical',
                        name: 'members',
                        title: 'Members',
                        fields: [
                            {
                                name: 'members',
                                type: 'acl-roles',
                                caption: 'Members',
                                extras: {
                                    placeholder: 'Enter login or name',
                                },
                            },
                            {
                                name: 'membersComment',
                                type: 'textarea',
                                caption: 'Comment for IDM',
                            },
                        ],
                    },
                ]}
            />
        );
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
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export default connector(GroupEditorDialog);
