import {connect} from 'react-redux';

import {setSetting} from '../../../store/actions/settings';
import {selectMastersHostType} from '../../../store/selectors/settings';

import {VisibleHostTypeRadioButtonBase} from './VisibleHostTypeRadioButtonBase';

const mapStateToProps = (state) => {
    return {
        hostType: selectMastersHostType(state),
    };
};

const mapDispatchToProps = {
    setSetting,
};

export const VisibleHostTypeRadioButton = connect(
    mapStateToProps,
    mapDispatchToProps,
)(VisibleHostTypeRadioButtonBase);
