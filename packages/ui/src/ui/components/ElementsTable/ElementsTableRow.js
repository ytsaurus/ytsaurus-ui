import React from 'react';
import PropTypes from 'prop-types';
import block from 'bem-cn-lite';

import {
    ELEMENTS_TABLE,
    prepareCellClassName,
    getColumnEdgePosition,
    TemplatesPropType,
    getRenderer,
} from './utils';

export default class ElementsTableRow extends React.PureComponent {
    static propTypes = {
        css: PropTypes.string,
        templates: TemplatesPropType,
        item: PropTypes.object.isRequired,
        itemHeight: PropTypes.number,
        itemMods: PropTypes.func,
        index: PropTypes.number.isRequired,
        selected: PropTypes.bool.isRequired,
        columnSet: PropTypes.object.isRequired,
        columnItems: PropTypes.object.isRequired,
        onItemClick: PropTypes.func,
        onItemHover: PropTypes.func,
        toggleItemState: PropTypes.func,
        itemState: PropTypes.object,
        cssHover: PropTypes.bool.isRequired,
        onItemSelect: PropTypes.func,
        rowClassName: PropTypes.func,
    };

    componentDidUpdate() {
        const {selected, onItemSelect} = this.props;

        if (onItemSelect && selected) {
            onItemSelect();
        }
    }

    getItemMods(item, index) {
        const {itemMods, css} = this.props;

        return typeof itemMods === 'function' ? block(css)('table-row', itemMods(item, index)) : '';
    }

    getColumn(columnName) {
        return this.props.columnItems[columnName];
    }

    onMouseClick = (e) => {
        const {onItemClick} = this.props;
        if (typeof onItemClick === 'function') {
            onItemClick(e);
        }
    };

    renderCell(cell, columnName, rowIndex, colIndex) {
        const {
            css,
            templates: templatesCollection,
            columnSet,
            columnItems,
            toggleItemState,
            itemState,
            colSpan,
        } = this.props;
        const edgePosition = getColumnEdgePosition(columnSet, columnItems, colIndex);
        const cellClassName = prepareCellClassName(columnItems, columnName, css, edgePosition);
        const renderer = getRenderer(this, templatesCollection, columnName);

        const colSpanValue = !colSpan ? undefined : colSpan(cell, rowIndex, colIndex);
        return {
            colSpanValue,
            node: (
                <td key={columnName} className={cellClassName} colSpan={colSpanValue}>
                    {renderer(cell, columnName, toggleItemState, itemState)}
                </td>
            ),
        };
    }

    render() {
        const {
            columnSet,
            item,
            itemHeight,
            index,
            selected,
            onItemHover,
            cssHover,
            onMouseMove,
            rowClassName: classNameFn,
        } = this.props;

        const extraClassName = classNameFn ? classNameFn(item, index) : '';
        const rowClassName = block(ELEMENTS_TABLE)(
            'row',
            {
                selected: selected ? 'yes' : undefined,
                hover: cssHover ? 'yes' : undefined,
            },
            [this.getItemMods(item, index), extraClassName].filter(Boolean).join(' '),
        );
        const rowStyle = {height: itemHeight};

        const cells = [];
        for (let i = 0; i < columnSet.items.length; ) {
            const columnName = columnSet.items[i];
            const {node, colSpanValue} = this.renderCell(item, columnName, index, i);
            cells.push(node);
            i += colSpanValue > 0 ? colSpanValue : 1;
        }

        return (
            <tr
                className={rowClassName}
                onMouseMove={onMouseMove}
                onClick={this.onMouseClick}
                onMouseEnter={onItemHover}
                data-index={index}
                style={rowStyle}
            >
                {cells}
            </tr>
        );
    }
}
