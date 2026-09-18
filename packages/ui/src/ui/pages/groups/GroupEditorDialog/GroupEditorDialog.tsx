import {connect} from 'react-redux';

import {closeGroupEditorModal, fetchGroups, saveGroupData} from '../../../store/actions/groups';
import {
    selectGroupEditorGroupIdm,
    selectGroupEditorGroupName,
    selectGroupEditorIdmDataOtherMembers,
    selectGroupEditorRoles,
    selectGroupEditorVisible,
} from '../../../store/selectors/groups';
import {type RootState} from '../../../store/reducers';

import './GroupEditorDialog.scss';

import {GroupEditorDialogBase} from './GroupEditorDialogBase';

const mapStateToProps = (state: RootState) => {
    const otherMembers = selectGroupEditorIdmDataOtherMembers(state);
    const {responsible, members} = selectGroupEditorRoles(state);
    return {
        visible: selectGroupEditorVisible(state),
        groupName: selectGroupEditorGroupName(state),
        idm: selectGroupEditorGroupIdm(state),
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

const GroupEditorDialog = connect(mapStateToProps, mapDispatchToProps)(GroupEditorDialogBase);

export default GroupEditorDialog;
