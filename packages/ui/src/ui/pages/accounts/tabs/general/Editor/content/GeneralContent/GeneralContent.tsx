import {connect} from 'react-redux';
import {
    loadEditedAccount,
    setParentAccountAction,
} from '../../../../../../../store/actions/accounts/accounts';
import {selectCluster} from '../../../../../../../store/selectors/global';
import {selectIsAdmin} from '../../../../../../../store/selectors/global/is-developer';

import '../../Editor.scss';
import {type RootState} from '../../../../../../../store/reducers';

import {GeneralContentBase} from './GeneralContentBase';

const mapStateToProps = (state: RootState) => {
    return {
        cluster: selectCluster(state),
        isAdmin: selectIsAdmin(state),
    };
};

const mapDispatchToProps = {
    loadEditedAccount,
    setAccountParent: setParentAccountAction,
};

export const GeneralContent = connect(mapStateToProps, mapDispatchToProps)(GeneralContentBase);
