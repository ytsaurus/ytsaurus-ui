import {connect} from 'react-redux';

import {
    selectCurrentOffsetValues,
    selectIsTableSorted,
} from '../../../../../store/selectors/navigation/content/table';
import {
    closeOffsetSelectorModal,
    moveOffset,
} from '../../../../../store/actions/navigation/content/table/pagination';

import './OffsetSelectorModal.scss';

import {OffsetSelectorModalBase} from './OffsetSelectorModalBase';

const mapStateToProps = (state) => {
    const {isOffsetSelectorOpen} = state.navigation.content.table;
    const initialItems = selectCurrentOffsetValues(state);
    const isTableSorted = selectIsTableSorted(state);

    return {isOffsetSelectorOpen, initialItems, isTableSorted};
};

const mapDispatchToProps = {
    closeOffsetSelectorModal,
    moveOffset,
};

const OffsetSelectorModal = connect(mapStateToProps, mapDispatchToProps)(OffsetSelectorModalBase);

export default OffsetSelectorModal;
