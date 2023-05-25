import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import cn from 'bem-cn-lite';

import hammer from '../../common/hammer';

import Link from '../Link/Link';
import Icon from '../Icon/Icon';

import './MetaTable.scss';

const block = cn('meta-table');
const itemBlock = cn('meta-table-item');

export * from './templates/Template';
export * from './templates/OperationTemplate';

export interface MetaTableProps {
    className?: string;
    items: Array<MetaTableItem> | Array<Array<MetaTableItem>>;
    title?: string;
    subTitles?: Array<string>;
    qa?: string;
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

function splitItems(items: MetaTableProps['items'], subTitles?: Array<string>) {
    if (Array.isArray(items[0])) {
        const groupTitles = !subTitles?.length
            ? undefined
            : _.reduce(
                  items,
                  (acc, _item, index) => {
                      acc.push(subTitles[Number(index)]);
                      return acc;
                  },
                  [] as Array<string>,
              );
        return {withInnerGroups: items as Array<Array<MetaTableItem>>, groupTitles};
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

    renderItems(visibleItems?: Array<MetaTableItem>) {
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

    renderGroup(group: Array<MetaTableItem>, index: number, groupTitles?: Array<string>) {
        const title = !groupTitles?.length ? null : groupTitles[index!] ?? <>&nbsp;</>;
        const visibleItems = _.filter(group, (item) => item.visible !== false);

        return !visibleItems?.length ? null : (
            <div className={block('group', itemBlock())} key={index}>
                {title && this.renderTitle(title)}
                {this.renderItems(visibleItems)}
            </div>
        );
    }

    renderTitle(title: string) {
        return <h2 className={block('title')}>{title}</h2>;
    }

    render() {
        const {items, className, title, subTitles, qa} = this.props;
        const {groups, withInnerGroups, groupTitles} = splitItems(items, subTitles);

        return (
            <div className={block(null, className)} data-qa={qa}>
                {title && this.renderTitle(title)}
                {withInnerGroups
                    ? _.map(withInnerGroups, (item, index) =>
                          this.renderGroup(item, index, groupTitles),
                      )
                    : this.renderGroup(groups, 0)}
            </div>
        );
    }
}
