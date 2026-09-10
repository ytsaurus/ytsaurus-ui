import {connect} from 'react-redux';
import {
    changeCellSize,
    changePageSize,
} from '../../../../../../store/actions/navigation/content/table/table';
import {
    selectCellSize,
    selectPageSize,
} from '../../../../../../store/selectors/navigation/content/table-ts';
import {selectSettingTableDisplayRawStrings} from '../../../../../../store/selectors/settings';
import {setTableDisplayRawStrings} from '../../../../../../store/actions/settings/settings';
import {type RootState} from '../../../../../../store/reducers';

import {SettingsButtonBase} from './SettingsButtonBase';

const mapStateToProps = (state: RootState) => {
    const {isFullScreen} = state.navigation.content.table;
    const pageSize = selectPageSize(state);
    const cellSize = selectCellSize(state);

    const allowRawStrings = selectSettingTableDisplayRawStrings(state);

    return {pageSize, cellSize, isFullScreen, allowRawStrings};
};

const mapDispatchToProps = {
    changePageSize,
    changeCellSize,
    setTableDisplayRawStrings,
};

export const SettingsButton = connect(mapStateToProps, mapDispatchToProps)(SettingsButtonBase);
