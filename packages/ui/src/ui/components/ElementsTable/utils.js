import React from 'react';
import block from 'bem-cn-lite';
import PropTypes from 'prop-types';
import hammer from '../../common/hammer';
import templates from '../templates/templates';

export const ELEMENTS_TABLE = 'elements-table';

export const TemplatesPropType = PropTypes.oneOfType([
    PropTypes.shape({
        key: PropTypes.string,
        data: PropTypes.object,
    }),
    PropTypes.objectOf(PropTypes.func),
]);

export function getRenderer(context, templatesCollection, columnName) {
    const {key} = templatesCollection;
    let renderer;

    if (key) {
        renderer = templates.get(key)[columnName] || templates.get(key).__default__;
        renderer = renderer?.bind(context);
    } else {
        // new way of passing templates
        renderer = templatesCollection[columnName] || templatesCollection.__default__;
    }
    return renderer || templates.__default__;
}

export function getColumnCaption(column, columnName) {
    const caption =
        column && typeof column.caption !== 'undefined'
            ? column.caption
            : hammer.format['ReadableField'](columnName);

    return column && column.title ? <span title={column.title}>{caption}</span> : caption;
}

export function getColumnEdgePosition(columnSet, columnItems, columnIndex, groupRowPlacement) {
    const columnName = columnSet.items[columnIndex];
    const column = columnItems[columnName];
    const isFirstColumn = columnIndex === 0;
    const isLastColumn = columnIndex === columnSet.items.length - 1;
    const isGroupFirstItem =
        groupRowPlacement === 'top' && column.groupName && column.groupFirstItem;
    const isLastGroupColumn =
        isGroupFirstItem && column.groupCount + columnIndex === columnSet.items.length;

    if (isFirstColumn) {
        return 'start';
    } else if (isLastColumn || isLastGroupColumn) {
        return 'end';
    }
}

export function prepareColumnsData({items, sets, mode}, userMode) {
    const currentColumnSet = sets[userMode || mode];
    const preparedColumnItems = {};
    const preparedColumnSet = {
        items: [],
    };

    currentColumnSet.items.forEach((columnName) => {
        const columnItem = items[columnName];

        if (!columnItem) {
            return;
        }

        if (columnItem.group) {
            const groupName = getColumnCaption(columnItem, columnName);

            preparedColumnSet.hasGroups = true;
            columnItem.set.forEach((groupColumnName, groupColumnIndex) => {
                const groupColumnKey = columnName + '_' + groupColumnName;
                const groupColumnItem = {
                    ...columnItem.items[groupColumnName],
                    groupName,
                };

                if (groupColumnIndex === 0) {
                    groupColumnItem.groupFirstItem = true;
                    groupColumnItem.headerStyle = columnItem.groupHeaderStyle;
                    groupColumnItem.groupCount = columnItem.set.length;
                    groupColumnItem.groupId = columnName;
                }

                groupColumnItem.caption = getColumnCaption(groupColumnItem, groupColumnName);
                preparedColumnItems[groupColumnKey] = groupColumnItem;
                preparedColumnSet.items.push(groupColumnKey);
            });
        } else {
            preparedColumnItems[columnName] = columnItem;
            preparedColumnSet.items.push(columnName);
        }
    });

    return {
        items: preparedColumnItems,
        set: preparedColumnSet,
    };
}

export function prepareCellClassName(columnItems, columnName, baseClassName, edgePosition) {
    const column = columnItems[columnName];
    const columnClassName = column?.className;
    const mix =
        column && baseClassName
            ? block(baseClassName)(
                  'table-item',
                  {
                      type: hammer.format['CssTemplateField'](columnName),
                  },
                  columnClassName,
              )
            : columnClassName;

    return block(ELEMENTS_TABLE)(
        'cell',
        {
            align: column && column.align,
            edge: edgePosition,
        },
        mix,
    );
}

export function prepareGroupCellClassName(groupId, baseClassName, edgePosition) {
    const mix = baseClassName
        ? block(baseClassName)('table-group-item', {
              type: hammer.format['CssTemplateField'](groupId),
          })
        : undefined;

    return block(ELEMENTS_TABLE)(
        'cell',
        {
            align: 'center',
            edge: edgePosition,
        },
        mix,
    );
}

export function prepareTableClassName({
    css,
    size,
    theme,
    striped,
    padded,
    onItemClick,
    getItemLink,
    selectedIndex,
    cssTableMods,
}) {
    return block(ELEMENTS_TABLE)(
        {
            size,
            theme,
            striped: striped ? 'yes' : undefined,
            'padded-edge': padded ? 'yes' : undefined,
            interactive:
                (onItemClick || getItemLink) && typeof selectedIndex === 'undefined' ? 'yes' : '',
        },
        css ? block(css)('table', cssTableMods) : undefined,
    );
}
