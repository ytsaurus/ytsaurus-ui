import {connect} from 'react-redux';

import {confirmAction, dismissAction} from '../../store/actions/actions';

import {ActionModalBase} from './ActionModalBase';

const mapStateToProps = ({actions}) => actions;

const mapDispatchToProps = {
    dismissAction,
    confirmAction,
};

const ActionModal = connect(mapStateToProps, mapDispatchToProps)(ActionModalBase);

export default ActionModal;
