import {connect} from 'react-redux';

import {selectIsDynamic} from '../../../../../../store/selectors/navigation/content/table-ts';
import {
    selectIsPaginationDisabled,
    selectIsTableEndReached,
    selectOffsetValue,
} from '../../../../../../store/selectors/navigation/content/table';
import {
    moveOffsetToEnd,
    moveOffsetToLeft,
    moveOffsetToRight,
    moveOffsetToStart,
} from '../../../../../../store/actions/navigation/content/table/pagination';

import {PaginatorBase} from './PaginatorBase';

const mapStateToProps = (state) => {
    const {error} = state.navigation.content.table;

    const isPaginationDisabled = selectIsPaginationDisabled(state);
    const isTableEndReached = selectIsTableEndReached(state);
    const offsetValue = selectOffsetValue(state);
    const isDynamic = selectIsDynamic(state);

    return {
        error,
        isDynamic,
        offsetValue,
        isPaginationDisabled,
        isTableEndReached,
    };
};

const mapDispatchToProps = {
    moveOffsetToStart,
    moveOffsetToLeft,
    moveOffsetToRight,
    moveOffsetToEnd,
};

export const Paginator = connect(mapStateToProps, mapDispatchToProps)(PaginatorBase);
