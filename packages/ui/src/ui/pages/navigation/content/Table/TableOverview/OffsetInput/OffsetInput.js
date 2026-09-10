import {connect} from 'react-redux';

import {
    selectOffsetValue,
    selectProgressWidth,
    selectRowCount,
} from '../../../../../../store/selectors/navigation/content/table';
import {selectIsDynamic} from '../../../../../../store/selectors/navigation/content/table-ts';
import {moveOffset} from '../../../../../../store/actions/navigation/content/table/pagination';

import '../TableOverview.scss';

import {OffsetInputBase} from './OffsetInputBase';

const mapStateToProps = (state) => {
    const progressWidth = selectProgressWidth(state);
    const offsetValue = selectOffsetValue(state);
    const isDynamic = selectIsDynamic(state);
    const rowCount = selectRowCount(state);

    return {progressWidth, offsetValue, rowCount, isDynamic};
};

const mapDispatchToProps = {
    moveOffset,
};

export const OffsetInput = connect(mapStateToProps, mapDispatchToProps)(OffsetInputBase);
