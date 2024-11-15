import {YTDFDialog, extractChangedSubjects, prepareRoleListValue} from '../../../components/Dialog';
import React from 'react';
import cn from 'bem-cn-lite';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import map_ from 'lodash/map';

import {closeGroupEditorModal, saveGroupData} from '../../../store/actions/groups';
import {
    getGroupEditorGroupIdm,
    getGroupEditorGroupName,
    getGroupEditorIdmDataOtherMembers,
    getGroupEditorRoles,
    getGroupEditorVisible,
} from '../../../store/selectors/groups';

import './GroupEditorDialog.scss';

const block = cn('group-editor-dialog');

const MemberPropType = {
    user: PropTypes.string,
    group: PropTypes.string,
    group_name: PropTypes.string,
};

class GroupEditorDialog extends React.Component {
    static prepareMembers(subjects) {
        return map_(subjects, ({user, group, group_name: name, ...rest}) => {
            if (group) {
                return {group, name: name || group};
            }
            return {...rest, user, name: user};
        }).filter(Boolean);
    }

    static prepareCurrent(subjects, others) {
        const current = {
            title: 'Current',
            data: [],
            itemClassName: block('item', {current: true}),
        };

        const namedSubjects = GroupEditorDialog.prepareMembers(subjects);
        current.data = map_(namedSubjects, ({name, frozen, ...rest}) => {
            return {
                title: name,
                frozen,
                data: rest,
            };
        });

        const tmp = map_(others, (name) => {
            return {title: name, frozen: true};
        });

        current.data = current.data.concat(tmp);

        return [current].filter(({data}) => data.length);
    }

    static propTypes = {
        className: PropTypes.string,
        visible: PropTypes.bool,
        groupName: PropTypes.string,
        idm: PropTypes.bool,
        members: PropTypes.arrayOf(PropTypes.shape(MemberPropType)),
        responsible: PropTypes.arrayOf(PropTypes.shape(MemberPropType)),
        otherMembers: PropTypes.arrayOf(PropTypes.string),

        saveGroupData: PropTypes.func,
        closeGroupEditorModal: PropTypes.func.isRequired,
    };

    onSubmit = (form) => {
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
        );
    };

    render() {
        const {visible, closeGroupEditorModal, groupName, idm, members, otherMembers, responsible} =
            this.props;
        return (
            <YTDFDialog
                size={'l'}
                className={block(null)}
                pristineSubmittable={false}
                visible={visible}
                headerProps={{
                    title: groupName,
                }}
                confirmText="Confirm"
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
                        ].filter(Boolean),
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

const mapStateToProps = (state) => {
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

export default connect(mapStateToProps, mapDispatchToProps)(GroupEditorDialog);
