import {connect} from 'react-redux';
import {changeConsumerMode} from '../../../../../store/actions/navigation/tabs/consumer/filters';
import {type RootState} from '../../../../../store/reducers';
import {selectConsumerMode} from '../../../../../store/selectors/navigation/tabs/consumer';

import './Toolbar.scss';

import {ToolbarBase} from './ToolbarBase';

function mapStateToProps(state: RootState) {
    return {
        consumerMode: selectConsumerMode(state),
    };
}

const mapDispatchToProps = {
    changeConsumerMode,
};

const Toolbar = connect(mapStateToProps, mapDispatchToProps)(ToolbarBase);

export default Toolbar;
