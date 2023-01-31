import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';
import _ from 'lodash';

import hammer from '../../common/hammer';

import './MetaTable.scss';
import Link from '../Link/Link';
import Icon from '../Icon/Icon';

const block = cn('meta-table');
const itemBlock = cn('meta-table-item');

export * from './templates/Template';
export * from './templates/OperationTemplate';

export interface MetaTableProps {
    className?: string;
    items: Array<MetaTableItem> | Array<Array<MetaTableItem>>;
    title?: string;
}

export interface MetaTableItem {
    key: string;
    label?: string;
    value: boolean | React.ReactNode;
    icon?: React.ReactNode;
    visible?: boolean;
    helpUrl?: string;
    className?: string;
}

function splitItems(items: MetaTableProps['items']) {
    if (Array.isArray(items[0])) {
        return {withInnerGroups: items as Array<Array<MetaTableItem>>};
    } else {
        return {groups: items as Array<MetaTableItem>};
    }
}

export default class MetaTable extends Component<MetaTableProps> {
    static itemProps = PropTypes.shape({
        icon: PropTypes.node,
        key: PropTypes.string.isRequired,
        label: PropTypes.node,
        value: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.bool,
            PropTypes.array,
            PropTypes.number,
            PropTypes.element,
        ]),
        visible: PropTypes.bool,
    });

    static propTypes = {
        items: PropTypes.arrayOf(
            PropTypes.oneOfType([MetaTable.itemProps, PropTypes.arrayOf(MetaTable.itemProps)]),
        ).isRequired,
        className: PropTypes.string,
        title: PropTypes.string,
    };

    renderKey(key: string, icon: React.ReactNode, label?: string) {
        return (
            <div className={itemBlock('key')} key={key + '-key'}>
                {icon}
                {label !== undefined ? label : hammer.format['ReadableField'](key)}
            </div>
        );
    }

    renderValue(item: MetaTableItem) {
        const {value, key, helpUrl, className} = item;
        return (
            <div className={itemBlock('value', className)} key={key + '-value'}>
                {typeof value === 'boolean' ? String(value) : value}
                {helpUrl && (
                    <Link theme={'ghost'} url={helpUrl}>
                        {' '}
                        <Icon awesome={'question-circle'} />
                    </Link>
                )}
            </div>
        );
    }

    renderItems(items?: Array<MetaTableItem>) {
        const visibleItems = _.filter(items, (item) => item.visible !== false);

        return (
            <Fragment>
                {_.map(visibleItems, (item) => (
                    <Fragment key={item.key + '-fragment'}>
                        {this.renderKey(item.key, item.icon, item.label)}
                        {this.renderValue(item)}
                    </Fragment>
                ))}
            </Fragment>
        );
    }

    renderGroup(group?: Array<MetaTableItem>, key?: string) {
        return (
            <div className={block('group', itemBlock())} key={key}>
                {this.renderItems(group)}
            </div>
        );
    }

    render() {
        const {items, className, title} = this.props;
        const {groups, withInnerGroups} = splitItems(items);

        return (
            <div className={block(null, className)}>
                {title && <h2 className={block('title')}>{title}</h2>}
                {withInnerGroups
                    ? _.map(withInnerGroups, (item, index) =>
                          this.renderGroup(item, 'group-' + index),
                      )
                    : this.renderGroup(groups)}
            </div>
        );
    }
}
