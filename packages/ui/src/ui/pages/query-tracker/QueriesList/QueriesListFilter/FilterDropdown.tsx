import React, {FC, PropsWithChildren} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {resetFilter} from '../../../../store/actions/query-tracker/queriesList';
import './FilterDropdown.scss';
import cn from 'bem-cn-lite';
import {Button, Flex, Icon, Text} from '@gravity-ui/uikit';
import TrashBinIcon from '@gravity-ui/icons/svgs/trash-bin.svg';
import {QueryStateFilter} from './QueryStateFilter';
import {QueryUserFilter} from './QueryUserFilter';
import {QueryDateFilter} from './QueryDateFilter';
import {hasCustomHistoryFilters} from '../../../../store/selectors/query-tracker/queriesList';

const block = cn('yt-qt-filter-dropdown');

const Block: FC<PropsWithChildren<{title: string}>> = ({title, children}) => {
    return (
        <Flex direction="column" gap={2}>
            <Text variant="subheader-1">{title}</Text>
            {children}
        </Flex>
    );
};

export const FilterDropdown: FC = () => {
    const dispatch = useDispatch();
    const changed = useSelector(hasCustomHistoryFilters);

    const handleResetFilter = React.useCallback(() => {
        dispatch(resetFilter());
    }, [dispatch]);

    return (
        <Flex className={block()} direction="column" gap={3}>
            <Block title="Operation date">
                <QueryDateFilter />
            </Block>
            <Block title="Operation owner">
                <QueryUserFilter />
            </Block>
            <Block title="Query state">
                <QueryStateFilter />
            </Block>
            {changed && (
                <Flex justifyContent="flex-end">
                    <Button view="outlined" onClick={handleResetFilter}>
                        <Icon data={TrashBinIcon} size={16} /> Reset filters
                    </Button>
                </Flex>
            )}
        </Flex>
    );
};
