import React, {Component, Fragment} from 'react';

import filter_ from 'lodash/filter';
import map_ from 'lodash/map';
import reduce_ from 'lodash/reduce';

import cn from 'bem-cn-lite';

import {format} from '../../utils';
import {Icon, Link} from '@gravity-ui/uikit';
import CircleQuestionIcon from '@gravity-ui/icons/svgs/circle-question.svg';

import {Secondary} from '../Text';
import {Tooltip} from '../Tooltip';

import './MetaTable.scss';
import {toClassName} from './helpers/toClassName';

const block = cn('meta-table');
const itemBlock = cn('meta-table-item');

export interface MetaTableProps {
    className?: string;
    items: Array<MetaTableItem> | Array<Array<MetaTableItem>>;
    title?: string;
    subTitles?: Array<string>;
    qa?: string;
    rowGap?: 4;
    alignItems?: 'baseline';
}

export interface MetaTableItem {
    key: string;
    label?: React.ReactChild;
    labelTopPadding?: string;
    value: boolean | React.ReactNode;
    icon?: React.ReactNode;
    visible?: boolean;
    helpUrl?: string;
    tooltip?: React.ReactNode;
    className?: string;
    qa?: string;
}

const splitItems = (items: MetaTableProps['items'], subTitles?: Array<string>) => {
    if (Array.isArray(items[0])) {
        const groupTitles = subTitles?.length
            ? reduce_(
                  items,
                  (acc, _item, index) => {
                      acc.push(subTitles[Number(index)]);
                      return acc;
                  },
                  [] as Array<string>,
              )
            : undefined;
        return {withInnerGroups: items as Array<Array<MetaTableItem>>, groupTitles};
    }
    return {groups: items as Array<MetaTableItem>};
};

export class MetaTable extends Component<MetaTableProps> {
    renderKey(item: MetaTableItem) {
        const {key, icon, label, labelTopPadding} = item;
        return (
            <div
                className={itemBlock('key', {key: toClassName(key)})}
                style={{paddingTop: labelTopPadding}}
                key={key + '-key'}
            >
                {icon}
                {label === undefined ? format['ReadableField'](key) : label}
            </div>
        );
    }

    renderValue(item: MetaTableItem) {
        const {value, key, helpUrl, tooltip, className, qa} = item;

        const questionIcon = (
            <React.Fragment>
                {' '}
                <Icon className={itemBlock('help-icon')} data={CircleQuestionIcon} size={14} />
            </React.Fragment>
        );
        return (
            <Tooltip
                content={tooltip}
                className={itemBlock('value', {key: toClassName(key)}, className)}
                key={key + '-value'}
                qa={qa}
            >
                {typeof value === 'boolean' ? String(value) : value}
                {helpUrl ? (
                    <Link view="secondary" href={helpUrl}>
                        {questionIcon}
                    </Link>
                ) : (
                    Boolean(tooltip) && <Secondary>{questionIcon}</Secondary>
                )}
            </Tooltip>
        );
    }

    renderItems(visibleItems?: Array<MetaTableItem>) {
        return (
            <Fragment>
                {map_(visibleItems, (item) => (
                    <Fragment key={item.key + '-fragment'}>
                        {this.renderKey(item)}
                        {this.renderValue(item)}
                    </Fragment>
                ))}
            </Fragment>
        );
    }

    renderGroup(group: Array<MetaTableItem>, index: number, groupTitles?: Array<string>) {
        const {rowGap, alignItems} = this.props;
        let title: React.ReactNode = null;
        if (groupTitles?.length) {
            title = groupTitles[index] ?? <>&nbsp;</>;
        }

        const visibleItems = filter_(group, (item) => item.visible !== false);

        return !visibleItems?.length ? null : (
            <div
                className={block(
                    'group',
                    itemBlock({
                        'row-gap': rowGap ? String(rowGap) : undefined,
                        'align-items': alignItems,
                    }),
                )}
                key={index}
            >
                {title && <h2 className={block('sub-title')}>{title}</h2>}
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
                    ? map_(withInnerGroups, (item, index) =>
                          this.renderGroup(item, index, groupTitles),
                      )
                    : this.renderGroup(groups, 0)}
            </div>
        );
    }
}
