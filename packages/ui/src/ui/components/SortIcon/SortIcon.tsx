import React from 'react';
import cn from 'bem-cn-lite';

import format from '../../common/hammer/format';
import Icon from '../../components/Icon/Icon';
import {Tooltip} from '@ytsaurus/components';
import {OrderType, nextSortOrderValue} from '../../utils/sort-helpers';
import i18n from './i18n';

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
    size?: number;
}

export default class SortIcon extends React.Component<Props> {
    onClick = () => {
        const {order, onChange, allowUnordered, withUndefined} = this.props;
        if (!onChange) {
            return;
        }

        const nextOrder = nextSortOrderValue(order, allowUnordered, withUndefined);
        onChange(nextOrder);
    };

    render() {
        const {className, label, order, hidden, size = 13} = this.props;
        const icon = ICON_BY_TYPE[order || ''];

        return (
            <span className={block({hidden}, className)} onClick={this.onClick}>
                {label && <span className={block('label')}>{label}</span>}
                <Tooltip
                    className={block('icon')}
                    content={order ? format.ReadableField(order) : i18n('context_unordered')}
                >
                    <Icon awesome={icon} face="solid" size={size} />
                </Tooltip>
            </span>
        );
    }
}
