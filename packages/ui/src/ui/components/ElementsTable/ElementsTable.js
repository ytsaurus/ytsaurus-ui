import React, {Component, createRef} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import ReactList from 'react-list';
import block from 'bem-cn-lite';

import difference_ from 'lodash/difference';
import filter_ from 'lodash/filter';
import forEach_ from 'lodash/forEach';
import map_ from 'lodash/map';
import omit_ from 'lodash/omit';
import range_ from 'lodash/range';

import ElementsTableRow from './ElementsTableRow';
import ElementsTableHeader, {sortStateType} from './ElementsTableHeader';
import ErrorBoundary from '../../components/ErrorBoundary/ErrorBoundary';

import {toggleColumnSortOrder} from '../../store/actions/tables';
import action from '../../components/action/action';
import {
    ELEMENTS_TABLE,
    TemplatesPropType,
    getColumnEdgePosition,
    prepareCellClassName,
    prepareColumnsData,
    prepareTableClassName,
} from './utils';

import './ElementsTable.scss';

/**
 * @deprecated Please use DataTableYT
 */
class ElementsTable extends Component {
    static propTypes = {
        isLoading: PropTypes.bool,
        css: PropTypes.string,
        cssTableMods: PropTypes.string,
        templates: TemplatesPropType,
        size: PropTypes.string,
        theme: PropTypes.string,
        padded: PropTypes.bool,
        striped: PropTypes.bool,
        // ITEMS
        items: PropTypes.array,
        itemMods: PropTypes.func,
        computeKey: (props, propName, componentName) => {
            if (
                props['tree'] === true &&
                (props[propName] === undefined || typeof props[propName] !== 'function')
            ) {
                return new Error(
                    `For tree-like tables, ${propName} prop of ${componentName} has to be a function`,
                );
            }
        },
        onItemClick: PropTypes.func,
        getItemLink: PropTypes.func,
        onItemHover: PropTypes.func,
        toggleColumnSortOrder: PropTypes.func,
        // TREE DATA
        tree: PropTypes.bool,
        treeState: PropTypes.oneOf(['collapsed', 'expanded', 'mixed']),
        treeStateExpanded: PropTypes.arrayOf(PropTypes.string),
        onItemToggleState: PropTypes.func,
        // old SORT
        sortInfo: PropTypes.func, // ko.param, old tables
        // new SORT
        tableId: PropTypes.string,
        emptyDataDescription: PropTypes.string,
        sortState: sortStateType,
        // callBack SORT
        onSort: PropTypes.func,
        // COLUMNS
        columns: PropTypes.shape({
            items: PropTypes.object.isRequired,
            sets: PropTypes.object.isRequired,
            mode: PropTypes.string.isRequired,
        }).isRequired,
        columnsMode: PropTypes.string,
        // VIRTUAL RENDERING
        virtual: PropTypes.bool,
        virtualType: PropTypes.oneOf(['simple', 'variable', 'uniform']),
        header: PropTypes.bool,
        body: function (props, propName, componentName) {
            if (!props[propName] && props['virtual']) {
                return new Error(
                    `The ${propName} flag set to false is not allowed in conjunction with virtual flag set to true in ${componentName}.`,
                );
            }
        },
        itemHeight: PropTypes.number,
        // ROW SELECTION
        selectedIndex: PropTypes.number,
        cssHover: PropTypes.bool,
        onItemSelect: PropTypes.func,
        onMouseMove: PropTypes.func,

        rowClassName: PropTypes.func,
        colSpan: PropTypes.func,
        headerClassName: PropTypes.string,
    };

    static defaultProps = {
        items: [],
        body: true,
        header: true,
        templates: {},
        size: 'm',
        theme: 'bordered',
        padded: false,
        striped: true,
        tree: false,
        treeState: 'collapsed',
        treeStateExpanded: [],
        virtual: true,
        virtualType: 'uniform',
        cssHover: false,
    };

    static getEmptinessStates(keys) {
        const totalKeys = keys.length;
        let prevKey, prevKeyParts;

        return keys.reduce((states, key, index) => {
            // initially item is not empty
            states[key] = {empty: false};

            const keyParts = key.split('/');
            // if we haven't traversed deeper right after the previous item, then the previous item
            // doesn't have children, i.e. is empty
            if (prevKeyParts && prevKeyParts.length >= keyParts.length) {
                states[prevKey] = {empty: true};
            }
            // last item is always empty
            if (index === totalKeys - 1) {
                states[key] = {empty: true};
            }
            [prevKey, prevKeyParts] = [key, keyParts];
            return states;
        }, {});
    }

    // For tree start
    static collapsedAncestorExists(key, items, boundaryCondition) {
        // Due to tree-like table properties node's children always come after it in list;
        // we rely on this fact when calculating a child state - by querying its parents' states

        // Start by dropping the last component of item's address, which yield its parent address
        const parts = key.split('/').slice(0, -1);
        while (boundaryCondition(parts)) {
            const parentState = items[parts.join('/')];
            // if parent is collapsed, we're done, otherwise try the parent's parent and so on
            if (parentState && parentState.collapsed) {
                return true;
            }
            parts.pop();
        }
        return false;
    }

    static updateItemStates(props, state) {
        const {tree, treeState, computeKey} = props;
        const {treeState: prevTreeState} = state;
        let items = null;

        if (tree) {
            items = {...state.items};

            const oldKeys = Object.keys(items);
            const newKeys = props.items.map(computeKey);

            const toRemove = difference_(oldKeys, newKeys);
            let toAdd;

            // When new state is 'mixed', table was updated NOT due to clicking
            // 'Expand All'/'Collapse All' button
            if (treeState === 'mixed' || treeState === prevTreeState) {
                toAdd = difference_(newKeys, oldKeys);
                // Sort new keys so that the topmost in the tree come first - we rely on this fact in
                // collapsedAncestorExists() method. However toAdd got in the alternative branch doesn't
                // need to be sorted since props.items come already in the proper order
                toAdd.sort();
            } else {
                // when `treeState` setting changes, we have to recalculate everything from scratch
                toAdd = newKeys;
            }

            forEach_(ElementsTable.getEmptinessStates(newKeys), (state, key) => {
                items[key] = Object.assign({}, items[key], state);
            });

            items = omit_(items, toRemove);
            toAdd.forEach((key) => {
                // When tree is in mixed state, new subtrees start as collapsed
                const itemState = {collapsed: treeState !== 'expanded'};
                itemState.visible = !ElementsTable.collapsedAncestorExists(
                    key,
                    items,
                    (parts) => parts.length > 1,
                );
                items[key] = Object.assign({}, items[key], itemState);
            });
        }
        return items;
    }

    static getDerivedStateFromProps(props, state) {
        const {columns, columnsMode, computeKey} = props;
        const {items: columnItems, set: columnSet} = prepareColumnsData(columns, columnsMode);
        const nextState = {columnItems, columnSet};
        let items = ElementsTable.updateItemStates(props, state);
        forEach_(props.treeStateExpanded, (key) => {
            if (items[key] && items[key].collapsed) {
                items[key].collapsed = false;
                const itemKeys = map_(props.items, computeKey);
                items = ElementsTable.updateVisibilityState(itemKeys, items, key);
            }
        });
        if (items) {
            nextState.items = items;
        }
        if (props.treeState !== state.treeState) {
            nextState.treeState = props.treeState;
        }

        return nextState;
    }

    static updateVisibilityState(itemKeys, itemsState, toggledItemKey) {
        const itemKeyParts = toggledItemKey.split('/');
        // We process a table section starting from the first child of a clicked date
        // till the first item which is not a descendant of a clicked item.
        // To determine if `nodeA` is a descendant of `nodeX`, keys are examined:
        // if `nodeA` has key = keyX/other/parts, when keyX is the `nodeX` key, then
        // descendancy is proved.
        let currentIndex = itemKeys.indexOf(toggledItemKey) + 1;
        let currentKey = itemKeys[currentIndex];

        // TODO: remove implicit knowledge about key structure
        while (currentIndex < itemKeys.length && currentKey.startsWith(toggledItemKey + '/')) {
            const itemState = itemsState[currentKey];
            const visible = !ElementsTable.collapsedAncestorExists(
                currentKey,
                itemsState,
                (parts) => parts.length >= itemKeyParts.length,
            );
            Object.assign(itemState, {visible});

            currentIndex += 1;
            currentKey = itemKeys[currentIndex];
        }

        return itemsState;
    }

    state = {
        items: {},
    };

    componentDidUpdate(prevProps) {
        const {selectedIndex, onItemSelect} = this.props;
        const reactList = this.list?.current;

        if (prevProps.selectedIndex !== selectedIndex && onItemSelect && reactList) {
            const [firstIndex, lastIndex] = reactList.getVisibleRange();

            if (selectedIndex < firstIndex) {
                reactList.scrollAround(selectedIndex);
                window.scrollBy(0, -80);
            } else if (selectedIndex > lastIndex) {
                reactList.scrollAround(selectedIndex);
                window.scrollBy(0, 40);
            }
        }
    }

    prevMouseCoordinates = {};
    list = createRef();

    toggleItemState(toggledItemKey) {
        const {computeKey, tree} = this.props;

        if (tree) {
            let items = Object.assign({}, this.state.items);

            // Invert the `collapsed` state of an item which was clicked
            const item = Object.assign(items[toggledItemKey], {
                collapsed: !items[toggledItemKey].collapsed,
            });

            const itemKeys = this.props.items.map(computeKey);
            items = ElementsTable.updateVisibilityState(itemKeys, items, toggledItemKey);

            this.setState({items});

            const {onItemToggleState} = this.props;
            if (onItemToggleState) {
                onItemToggleState(toggledItemKey, item.collapsed);
            }
        }
    }

    isItemVisible = (item) => {
        const {computeKey} = this.props;
        return (this.state.items[computeKey(item)] || {}).visible;
    };
    // For tree end

    // For mouse hover start
    updateMouseCoordinates(evt) {
        this.prevMouseCoordinates.x = evt.clientX;
        this.prevMouseCoordinates.y = evt.clientY;
    }

    mouseCoordinatesChanged(evt) {
        const {x, y} = this.prevMouseCoordinates;
        const firstChange = x === 'undefined' && typeof y === 'undefined';

        if (firstChange) {
            this.updateMouseCoordinates(evt);

            return false;
        } else {
            return x !== evt.clientX || y !== evt.clientY;
        }
    }

    onItemHover = (evt) => {
        const {items, onItemHover} = this.props;

        if (this.mouseCoordinatesChanged(evt)) {
            this.updateMouseCoordinates(evt);

            if (onItemHover) {
                const index = evt.currentTarget.dataset.index;

                onItemHover(items[index], Number(index));
            }
        }
    };

    onItemSelect = () => {
        const {items, onItemSelect} = this.props;

        if (onItemSelect) {
            const index = this.props.selectedIndex;

            onItemSelect(items[index], Number(index));
        }
    };
    // For mouse hover end

    // For item click start
    linkOrButtonWasClicked(evt) {
        const isLinkOrButton = (node) => {
            return (
                node.nodeName === 'BUTTON' ||
                node.getAttribute('role') === 'button' ||
                node.nodeName === 'A'
            );
        };
        // one of nested <span>s inside <a> gets the mouse event first, check if its ancestor is a link
        let node = evt.target;
        while (node && node.nodeName !== 'TD') {
            if (isLinkOrButton(node)) {
                return true;
            }
            node = node.parentElement;
        }
        return false;
    }

    onItemClick = (evt) => {
        if (this.linkOrButtonWasClicked(evt)) {
            return;
        }

        const {items, onItemClick, getItemLink} = this.props;
        const index = Number(evt.currentTarget.dataset.index);
        const handleClick = action.makeEntryClickHandler(evt, onItemClick, getItemLink);
        handleClick(items[index], index, evt);
    };
    // For item click end

    // render methods start
    renderEmptyTableContent = (
        <div>
            <div className={block(ELEMENTS_TABLE)('empty-header')}>No items to show </div>
            {this.props.emptyDataDescription && (
                <div className={block(ELEMENTS_TABLE)('empty-content')}>
                    {this.props.emptyDataDescription}
                </div>
            )}
        </div>
    );

    renderEmptyCell = (cell, columnName, index) => {
        const {css} = this.props;
        const {columnSet, columnItems} = this.state;
        const edgePosition = getColumnEdgePosition(columnSet, columnItems, index);
        const cellClassName = prepareCellClassName(columnItems, columnName, css, edgePosition);

        return (
            <td key={columnName} className={cellClassName}>
                <div className={block(ELEMENTS_TABLE)('no-data-placeholder')} />
            </td>
        );
    };

    renderSkeletonState = () => {
        const {itemHeight} = this.props;
        const tableClassName = prepareTableClassName(this.props);
        const bodyClassName = block(ELEMENTS_TABLE)('body');
        const rowClassName = block(ELEMENTS_TABLE)('row', {empty: true});
        const rowStyle = {height: itemHeight};

        return (
            <table className={tableClassName}>
                {this.props.header && <ElementsTableHeader {...this.props} />}
                <tbody className={bodyClassName}>
                    {map_(range_(4), (index) => (
                        <tr key={index} className={rowClassName} style={rowStyle}>
                            {map_(this.state.columnItems, this.renderEmptyCell)}
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    renderRow(item, index, key = index) {
        const {
            css,
            itemHeight,
            templates,
            itemMods,
            selectedIndex,
            computeKey,
            cssHover,
            onMouseMove,
            rowClassName,
            colSpan,
        } = this.props;
        const {items: itemStates, columnItems, columnSet} = this.state;

        const selected = selectedIndex === index;
        const currentKey = typeof computeKey === 'function' ? computeKey(item) : key;

        return (
            <ElementsTableRow
                key={currentKey ?? `##elements_table_row_${key}`}
                onItemClick={this.onItemClick}
                onItemHover={this.onItemHover}
                onItemSelect={this.onItemSelect}
                columnSet={columnSet}
                columnItems={columnItems}
                toggleItemState={this.toggleItemState.bind(this, currentKey)}
                itemState={itemStates[currentKey]}
                item={item}
                itemHeight={itemHeight}
                css={css}
                templates={templates}
                selected={selected}
                index={index}
                itemMods={itemMods}
                onMouseMove={onMouseMove}
                cssHover={cssHover}
                rowClassName={rowClassName}
                colSpan={colSpan}
            />
        );
    }

    renderTableBody(items, ref) {
        const bodyClassName = block(ELEMENTS_TABLE)('body');

        // FIXME: In the case of virtual rendering, we need to consider the table header height among the virtual elements
        return (
            <tbody ref={ref} className={bodyClassName}>
                {items}
            </tbody>
        );
    }

    renderTableContent = (items, ref) => (
        <table className={prepareTableClassName(this.props)}>
            {this.props.header && <ElementsTableHeader {...this.props} />}
            {this.props.body && this.renderTableBody(items, ref)}
        </table>
    );

    renderDynamicTable(items) {
        const {virtualType, selectedIndex} = this.props;
        const itemRenderer = (index, key) => this.renderRow(items[index], index, key);

        return (
            <ReactList
                itemRenderer={itemRenderer}
                itemsRenderer={this.renderTableContent}
                scrollTo={selectedIndex}
                length={items.length}
                type={virtualType}
                ref={this.list}
                useStaticSize
            />
        );
    }

    renderSimpleTable(items) {
        const rows = map_(items, (item, index) => this.renderRow(item, index));

        return this.renderTableContent(rows);
    }

    renderTable() {
        const {items, virtual, tree, isLoading} = this.props;

        const visibleItems = tree ? filter_(items, this.isItemVisible) : items;

        if (isLoading) {
            return this.renderSkeletonState();
        } else if (items.length) {
            return virtual
                ? this.renderDynamicTable(visibleItems)
                : this.renderSimpleTable(visibleItems);
        } else {
            return this.props.body && this.renderEmptyTableContent;
        }
    }

    render() {
        const {virtual} = this.props;

        // FIXME: the elements-table-wrapper className was added to account for the <thead> height and get correct container size
        return (
            <ErrorBoundary>
                <div className={virtual ? 'elements-table-wrapper' : undefined}>
                    {this.renderTable()}
                </div>
            </ErrorBoundary>
        );
    }
}

const mapStateToProps = ({tables}) => {
    return {sortState: tables};
};

const mapDispatchToProps = {
    toggleColumnSortOrder,
};

export default connect(mapStateToProps, mapDispatchToProps)(ElementsTable);
