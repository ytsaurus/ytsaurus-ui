import React, {Component, Fragment} from 'react';
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
    rowGap?: 4;
}

export interface MetaTableItem {
    key: string;
    label?: React.ReactChild;
    value: boolean | React.ReactNode;
    icon?: React.ReactNode;
    visible?: boolean;
    helpUrl?: string;
    className?: string;
    qa?: string;
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
    renderKey(key: string, icon: React.ReactNode, label?: React.ReactChild) {
        return (
            <div className={itemBlock('key', {key})} key={key + '-key'}>
                {icon}
                {label !== undefined ? label : hammer.format['ReadableField'](key)}
            </div>
        );
    }

    renderValue(item: MetaTableItem) {
        const {value, key, helpUrl, className, qa} = item;
        return (
            <div className={itemBlock('value', {key}, className)} key={key + '-value'} data-qa={qa}>
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
        const {rowGap} = this.props;
        const title = !groupTitles?.length ? null : groupTitles[index!] ?? <>&nbsp;</>;
        const visibleItems = _.filter(group, (item) => item.visible !== false);

        return !visibleItems?.length ? null : (
            <div className={block('group', itemBlock({'row-gap': String(rowGap)}))} key={index}>
                {title && (
                    <>
                        <h2 className={block('sub-title')}>{title}</h2>
                        <span />
                    </>
                )}
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
