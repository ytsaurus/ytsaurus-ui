import cn from 'bem-cn-lite';
import React from 'react';

import Icon from '../../components/Icon/Icon';
import {OrderType, nextSortOrderValue} from '../../utils/sort-helpers';

import './SortIcon.scss';

const block = cn('sort-icon');

const ICON_BY_TYPE = {
    ['']: 'sort',
    asc: 'sort-up',
    desc: 'sort-down',
    'asc-undefined': 'arrow-to-bottom',
    'desc-undefined': 'arrow-from-bottom',
    'undefined-asc': 'arrow-from-top',
    'undefined-desc': 'arrow-to-top',
} as const;

interface Props {
    className?: string;
    label?: string;
    onChange?: (nextOrder: OrderType) => void;
    order?: OrderType;
    hidden?: boolean;
    allowUnordered?: boolean;
    withUndefined?: boolean;
}

export default function SortIcon({
    className,
    label,
    order,
    hidden,
    onChange,
    allowUnordered,
    withUndefined,
}: Props) {
    const onClick = () => {
        if (!onChange) {
            return;
        }

        const nextOrder = nextSortOrderValue(order, allowUnordered, withUndefined);
        onChange(nextOrder);
    };

    const icon = ICON_BY_TYPE[order || ''];

    return (
        <span className={block({hidden}, className)} onClick={onClick}>
            {label && <span className={block('label')}>{label}</span>}
            <span className={block('icon')}>
                <Icon awesome={icon} face="solid" />
            </span>
        </span>
    );
}
