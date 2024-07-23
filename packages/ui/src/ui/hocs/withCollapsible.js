import slice_ from 'lodash/slice';

import React from 'react';
import PropTypes from 'prop-types';
import {Button} from '@gravity-ui/uikit';

import {getDisplayName} from '../utils';

export default function withCollapsible(Component) {
    return class WithCollapsible extends React.Component {
        static propTypes = {
            items: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.element, PropTypes.object]))
                .isRequired,
            collapsed: PropTypes.bool,
            itemsCount: PropTypes.number,
            prepareVisibleItems: PropTypes.func,
            filterVisibleItems: PropTypes.func,
        };

        static defaultProps = {
            collapsed: true,
            itemsCount: 3,
            prepareVisibleItems: (items) => items,
            filterVisibleItems: (items, itemsCount) => slice_(items, 0, itemsCount),
        };

        static displayName = `WithCollapsible(${getDisplayName(Component)})`;

        state = {collapsed: this.props.collapsed};

        get items() {
            const {items, itemsCount, prepareVisibleItems, filterVisibleItems} = this.props;
            const {collapsed} = this.state;

            let visibleItems;

            if (prepareVisibleItems(items).length > itemsCount) {
                visibleItems = collapsed ? filterVisibleItems(items, itemsCount) : items;
            } else {
                visibleItems = items;
            }

            return visibleItems;
        }

        handleToggle = () => this.setState((prevState) => ({collapsed: !prevState.collapsed}));

        renderToggler = () => {
            const {items, itemsCount, prepareVisibleItems} = this.props;
            const {collapsed} = this.state;

            const visibleCount = prepareVisibleItems(items).length;
            const resCount = visibleCount - itemsCount;
            const hasToggler = visibleCount > itemsCount;

            return (
                hasToggler && (
                    <Button size="m" view="flat-secondary" onClick={this.handleToggle}>
                        {collapsed ? `Show more (${resCount})` : 'Show less'}
                    </Button>
                )
            );
        };

        render() {
            const {items, prepareVisibleItems} = this.props;
            const allPreparedItemsCount = prepareVisibleItems(items).length;

            return (
                <Component
                    {...this.props}
                    items={this.items}
                    renderToggler={this.renderToggler}
                    allItemsCount={allPreparedItemsCount}
                />
            );
        }
    };
}
