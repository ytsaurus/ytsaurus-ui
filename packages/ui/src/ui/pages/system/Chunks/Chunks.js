import {connect} from 'react-redux';

import {SYSTEM_CHUNKS_TABLE_ID} from '../../../constants/tables';
import {selectSettingsSystemChunksCollapsed} from '../../../store/selectors/settings/settings-ts';
import {setSettingsSystemChunksCollapsed} from '../../../store/actions/settings/settings';

import './Chunks.scss';
import {UI_COLLAPSIBLE_SIZE} from '../../../constants/global';

import {ChunksBase} from './ChunksBase';

function mapStateToProps(state) {
    const {replication, sealer, refresh, requisitionUpdate, cells, types} = state.system.chunks;

    return {
        replication,
        sealer,
        refresh,
        requisitionUpdate,
        cells,
        types,
        sortState: state.tables[SYSTEM_CHUNKS_TABLE_ID],
        collapsibleSize: UI_COLLAPSIBLE_SIZE,
        collapsed: selectSettingsSystemChunksCollapsed(state),
    };
}

const mapDispatchToProps = {
    setSettingsSystemChunksCollapsed,
};

const Chunks = connect(mapStateToProps, mapDispatchToProps)(ChunksBase);

export default Chunks;
