import React, {type FC} from 'react';
import {useDispatch, useSelector} from '../../../../../store/redux-hooks';
import {applyFilter, resetFilter} from '../../../../../store/actions/query-tracker/queriesList';
import '../FilterDropdown.scss';
import cn from 'bem-cn-lite';
import {Button, Flex, Icon} from '@gravity-ui/uikit';
import TrashBinIcon from '@gravity-ui/icons/svgs/trash-bin.svg';
import {
    selectHasCustomHistoryFilters,
    selectQueriesFilters,
} from '../../../../../store/selectors/query-tracker/queriesList';
import i18n from './i18n';

import {QueryHistoryFilterFields} from '../QueryHistoryFilterFields/QueryHistoryFilterFields';

const block = cn('yt-qt-filter-dropdown');

export const FilterDropdown: FC = () => {
    const dispatch = useDispatch();
    const {from, to, user, state} = useSelector(selectQueriesFilters);
    const changed = useSelector(selectHasCustomHistoryFilters);

    const handleResetFilter = React.useCallback(() => {
        dispatch(resetFilter());
    }, [dispatch]);

    return (
        <Flex className={block()} direction="column" gap={3}>
            <QueryHistoryFilterFields
                value={{from, to, user, state}}
                showEngine={false}
                onChange={(value) => dispatch(applyFilter(value))}
            />
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
