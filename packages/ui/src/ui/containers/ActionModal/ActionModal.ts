import {type RootState} from '../../store/reducers';
import {connect} from 'react-redux';

import {confirmAction, dismissAction} from '../../store/actions/actions';

import {ActionModalBase} from './ActionModalBase';

const mapStateToProps = ({actions}: RootState) => actions;

const mapDispatchToProps = {
    dismissAction,
    confirmAction,
};

export const connector = connect(mapStateToProps, mapDispatchToProps);

const ActionModal = connector(ActionModalBase);

export default ActionModal;
