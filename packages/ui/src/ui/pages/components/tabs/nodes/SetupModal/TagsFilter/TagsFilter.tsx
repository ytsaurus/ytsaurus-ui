import React from 'react';
import cn from 'bem-cn-lite';
import _ from 'lodash';

import FilterWithRegExp, {
    FilterWithRegExpValue,
} from '../../../../../../components/Filter/FilterWithRegExp';
import TagSelector from '../../../../../../components/TagSelector/TagSelector';

import './TagsFilter.scss';
import Button from '../../../../../../components/Button/Button';
import {DropdownMenu} from '@gravity-ui/uikit';
import Icon, {IconName} from '../../../../../../components/Icon/Icon';

const block = cn('tags-filter');

const TAG_FILTER_MODES = ['filter', 'union', 'intersection'] as const;

type TagFilterMode = (typeof TAG_FILTER_MODES)[number];

interface TagsFilterValue extends FilterWithRegExpValue {
    mode?: TagFilterMode;
    selected?: Array<string>;
}

interface Props {
    className?: string;

    size?: 's' | 'm' | 'l' | 'xl';

    value: TagsFilterValue;
    onChange: (v: Props['value']) => void;

    items?: Array<string>;

    allowedModes?: Array<TagsFilterValue['mode']>;

    selectPlaceholder?: string;
}

const defaultValue: Required<Props['value']> = {
    mode: 'filter',
    filter: '',
    useRegexp: false,
    selected: [],
    regexpError: '',
};

const ICONS: Record<Required<TagsFilterValue>['mode'], IconName> = {
    filter: 'filter',
    union: 'union',
    intersection: 'intersection',
};

function TagsFilter(props: Props) {
    const {
        value,
        onChange,
        className,
        size = 'm',
        items,
        selectPlaceholder,
        allowedModes = TAG_FILTER_MODES,
    } = props;
    const {
        mode = defaultValue.mode,
        filter = defaultValue.filter,
        selected = defaultValue.selected,
        useRegexp,
    } = value;

    const handleChange = React.useCallback(
        (v: Props['value']) => {
            const value = _.reduce(
                v,
                (acc, value, key) => {
                    if (value !== undefined) {
                        acc[key] = value;
                    }
                    return acc;
                },
                {} as any,
            );
            onChange(value);
        },
        [onChange],
    );

    const handleFilterChange = React.useCallback(
        (diff: FilterWithRegExpValue) => {
            handleChange({...value, ...diff});
        },
        [handleChange, value],
    );

    const handleSelectChange = React.useCallback(
        (selected?: Array<string>) => {
            handleChange({...value, selected});
        },
        [handleChange, value],
    );

    const selectedItems = React.useMemo(() => {
        return selected;
    }, [selected]);

    const control =
        mode === 'filter' ? (
            <FilterWithRegExp
                className={block('control')}
                pin={'round-brick'}
                size={size}
                value={{filter, useRegexp}}
                onChange={handleFilterChange}
            />
        ) : (
            <TagSelector
                className={block('control')}
                value={selectedItems}
                onChange={handleSelectChange}
                items={items}
                placeholder={selectPlaceholder}
                pin="round-brick"
            />
        );

    const modes = allowedModes.map((m) => {
        const itemMode = m!;
        return {
            icon: <Icon awesome={ICONS[itemMode]} />,
            text: itemMode[0].toUpperCase() + itemMode.substring(1),
            action: () => handleChange({...value, mode: itemMode}),
        };
    });

    return (
        <div className={block(null, className)}>
            {control}
            <DropdownMenu
                items={modes}
                switcher={
                    <Button size={size} width={'auto'} pin={'clear-round'}>
                        <Icon awesome={ICONS[mode]} />
                    </Button>
                }
            />
        </div>
    );
}

export default React.memo(TagsFilter);
