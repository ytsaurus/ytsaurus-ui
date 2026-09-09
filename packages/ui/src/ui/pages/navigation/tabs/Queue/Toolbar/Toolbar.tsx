import {connect} from 'react-redux';
import {changeQueueMode} from '../../../../../store/actions/navigation/tabs/queue/filters';
import {type RootState} from '../../../../../store/reducers';
import {selectQueueMode} from '../../../../../store/selectors/navigation/tabs/queue';
import './Toolbar.scss';

import {ToolbarBase} from './ToolbarBase';

function mapStateToProps(state: RootState) {
    return {
        queueMode: selectQueueMode(state),
    };
}

const mapDispatchToProps = {
    changeQueueMode,
};

const Toolbar = connect(mapStateToProps, mapDispatchToProps)(ToolbarBase);

export default Toolbar;
