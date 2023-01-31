import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';

import Hotkey from '../../../components/Hotkey/Hotkey';

import {getDisplayName} from '../../../utils';

import '../ElementsTable.scss';

export default (ElementsTable) => {
    return class WithKeyboardNavigation extends Component {
        static displayName = `WithKeyboardNavigation(${getDisplayName(ElementsTable)})`;

        static propTypes = {
            // from parent
            hotkeys: PropTypes.array,
            onItemClick: PropTypes.func,
            selectedIndex: PropTypes.number,
            items: PropTypes.array.isRequired,
        };

        static defaultProps = {
            hotkeys: [],
            selectedIndex: 0,
            onItemClick: () => {},
        };

        state = {
            hoverSelectedIndex: this.props.selectedIndex,
            selectedIndex: this.props.selectedIndex,
            mode: 'mouse',
        };

        get hotkeys() {
            return [
                ...this.props.hotkeys.map(this.wrapHotkeyHandler),

                {keys: 'k, up', handler: this.selectPrev, scope: 'all'},
                {keys: 'up', handler: this.selectPrev, scope: 'filter'},

                {keys: 'j, down', handler: this.selectNext, scope: 'all'},
                {keys: 'down', handler: this.selectNext, scope: 'filter'},

                {
                    keys: 'l, enter, ctrl+right',
                    handler: this.handleItemKeyboardClick,
                    scope: 'all',
                },
                {
                    keys: 'enter',
                    handler: this.handleItemKeyboardClick,
                    scope: 'filter',
                },
            ];
        }

        wrapHotkeyHandler = (params) => {
            const {handler, ...rest} = params;
            return {
                ...rest,
                handler: (...args) => {
                    const {items} = this.props;
                    const {selectedIndex} = this.state;
                    return handler(...args, {
                        item: items[selectedIndex],
                        index: selectedIndex,
                    });
                },
            };
        };

        selectIndex = (index) => {
            const {items} = this.props;
            const maxIndex = Math.max(0, items.length - 1);

            let state;
            if (index > maxIndex) {
                state = {
                    selectedIndex: maxIndex,
                    hoverSelectedIndex: maxIndex,
                };
            } else if (index < 0) {
                state = {
                    selectedIndex: 0,
                    hoverSelectedIndex: 0,
                };
            } else {
                state = {
                    selectedIndex: index,
                    hoverSelectedIndex: index,
                };
            }

            this.setState({mode: 'keyboard', ...state});
        };

        selectNext = () => {
            const {hoverSelectedIndex} = this.state;

            this.selectIndex(hoverSelectedIndex + 1);
        };

        selectPrev = () => {
            const {hoverSelectedIndex} = this.state;

            this.selectIndex(hoverSelectedIndex - 1);
        };

        handleMouseMove = () => {
            const {mode} = this.state;

            if (mode !== 'mouse') {
                this.setState({mode: 'mouse'});
            }
        };

        handleItemHover = (item, index) => {
            const {mode} = this.state;

            if (mode === 'mouse') {
                this.setState({
                    hoverSelectedIndex: index,
                });
            }
        };

        handleItemSelect = (item, index) => {
            const {mode} = this.state;
            const elem = document.querySelector(
                `.elements-table__row_selected_yes[data-index="${index}"]`,
            );

            if (elem && mode === 'keyboard') {
                const windowHeight = document.documentElement.clientHeight;
                const bounding = elem.getBoundingClientRect();
                const bottomCoordinate = bounding.y + bounding.height;
                const topCoordinate = bounding.y;

                if (bottomCoordinate > windowHeight) {
                    elem.scrollIntoView(false);
                } else if (topCoordinate < 120) {
                    elem.scrollIntoView(true);
                    window.scrollBy(0, -120);
                }
            }
        };

        handleItemKeyboardClick = () => {
            const {onItemClick, items} = this.props;
            const {selectedIndex} = this.state;

            if (items && items[selectedIndex]) {
                onItemClick(items[selectedIndex]);
            }
        };

        render() {
            const {selectedIndex, mode} = this.state;

            return (
                <Fragment>
                    <ElementsTable
                        {...this.props}
                        cssHover={mode === 'mouse'}
                        onItemHover={this.handleItemHover}
                        onMouseMove={this.handleMouseMove}
                        selectedIndex={mode === 'keyboard' ? selectedIndex : null}
                        onItemSelect={mode === 'keyboard' ? this.handleItemSelect : null}
                    />
                    <Hotkey settings={this.hotkeys} />
                </Fragment>
            );
        }
    };
};
