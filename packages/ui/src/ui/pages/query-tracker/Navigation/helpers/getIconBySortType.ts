import ArrowUpIcon from '@gravity-ui/icons/svgs/arrow-up.svg';
import ArrowDownIcon from '@gravity-ui/icons/svgs/arrow-down.svg';
import ArrowUpArrowDownIcon from '@gravity-ui/icons/svgs/arrow-up-arrow-down.svg';

export const getIconBySortType = (sortType: 'asc' | 'desc' | undefined) => {
    switch (sortType) {
        case 'asc':
            return ArrowUpIcon;
        case 'desc':
            return ArrowDownIcon;
        default:
            return ArrowUpArrowDownIcon;
    }
};
