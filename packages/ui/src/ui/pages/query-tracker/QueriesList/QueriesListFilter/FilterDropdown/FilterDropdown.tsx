import React, {type FC} from 'react';
import {useDispatch, useSelector} from '../../../../../store/redux-hooks';
import {applyFilter, resetFilter} from '../../../../../store/actions/query-tracker/queriesList';
import '../FilterDropdown.scss';
import cn from 'bem-cn-lite';
import {Button, Flex, Icon} from '@gravity-ui/uikit';
import TrashBinIcon from '@gravity-ui/icons/svgs/trash-bin.svg';
import {HistoryFilterForm} from '../HistoryFilterForm/HistoryFilterForm';
import {
    selectHasCustomHistoryFilters,
    selectQueriesFilters,
} from '../../../../../store/selectors/query-tracker/queriesList';
import i18n from './i18n';

const block = cn('yt-qt-filter-dropdown');

export const FilterDropdown: FC = () => {
    const dispatch = useDispatch();
    const filter = useSelector(selectQueriesFilters);
    const changed = useSelector(selectHasCustomHistoryFilters);

    const handleResetFilter = React.useCallback(() => {
        dispatch(resetFilter());
    }, [dispatch]);

    return (
        <Flex className={block()} direction="column" gap={3}>
            <HistoryFilterForm value={filter} onChange={(patch) => dispatch(applyFilter(patch))} />
            {changed && (
                <Flex justifyContent="flex-end">
                    <Button view="outlined" onClick={handleResetFilter}>
                        <Icon data={TrashBinIcon} size={16} />{' '}
                        {i18n('action_reset-additional-filters')}
                    </Button>
                </Flex>
            )}
        </Flex>
    );
};
