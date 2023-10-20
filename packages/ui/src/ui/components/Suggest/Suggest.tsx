import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ReactList from 'react-list';
import block from 'bem-cn-lite';
import _ from 'lodash';

import {Popup, PopupProps, TextInput, TextInputProps} from '@gravity-ui/uikit';

import templates from '../../components/templates/utils';

import './Suggest.scss';

const b = block('yt-suggest');

// TODO add is scrolled into view logic
// TODO support custom item height

export const itemsProps = PropTypes.arrayOf(
    PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
            value: PropTypes.string,
            text: PropTypes.string,
            counter: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        }),
    ]),
);

interface Item {
    value: string;
    text: string;
    counter?: string | number;
}

const ESCAPE = 27;
const ENTER = 13;
const ARROW_UP = 38;
const ARROW_DOWN = 40;

/*const TAB = 9;
const CTRL = 16;
const ALT = 17;
const ARROW_LEFT = 37;
const ARROW_RIGHT = 39;
const COMMAND = 91;*/

export interface SuggestProps {
    className?: string;

    filter: (items: SuggestProps['items'], text?: string) => SuggestProps['items'];
    apply?: (value: SuggestItem) => void;
    onTextUpdate?: (text: string) => void;
    onItemClick?: (item: SuggestItem) => void;
    clear?: () => void;
    placeholder?: string;
    autoFocus?: boolean;
    text?: string;
    defaultText?: string;
    disabled?: boolean;
    template?: {
        key: string;
    };
    items: Array<SuggestItem>;
    maxItems?: number | {totalAmount: number; groupPredicate: () => void};

    zIndexGroupLevel?: number;
    onBlur?: () => void;
    pin?: TextInputProps['pin'];
    onOpenChange?: (p: {open: boolean}) => void;
    popupClassName?: string;
    popupPlacement?: PopupProps['placement'];

    renderItem?: (item: SuggestItem) => React.ReactNode;
}

export type SuggestItem = string | Item;

interface State {
    text?: string;
    items: SuggestProps['items'];
    selectedIndex: number;
    popupVisible: boolean;

    prevItems: SuggestProps['items'];

    focused?: boolean;
}

export default class Suggest extends Component<SuggestProps, State> {
    static defaultProps = {
        disable: false,
        text: '',
        autoFocus: false,
        items: [],
        zIndexGroupLevel: 1,
        onBlur: () => {},
        focused: false,
    };

    private input = React.createRef<HTMLInputElement>();
    private isClearClicked = false; // the flag for the correct render text-input view after clear button click
    private isUnmounting = false;
    private skipApplyForNextBlur = false;

    constructor(props: SuggestProps) {
        super(props);

        this.state = {
            text: 'text' in props ? props.text : props.defaultText,
            items: props.items,
            selectedIndex: 0,
            popupVisible: false,
            prevItems: [],
        };

        this.onFocus = this.onFocus.bind(this);
        this.onBlur = this.onBlur.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.hideSuggestions = this.hideSuggestions.bind(this);
        this.clearSuggestions = this.clearSuggestions.bind(this);
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    static getDerivedStateFromProps(props: SuggestProps, prevState: State) {
        const text = !prevState.focused && 'text' in props ? props.text : prevState.text;

        if (props.items === prevState.prevItems && text === prevState.text) {
            return null;
        }

        const items = props.filter(props.items, text);
        const res = {items, prevItems: props.items, text};

        return res;
    }

    componentDidMount() {
        this.isClearClicked = false;
    }

    componentWillUnmount() {
        this.isUnmounting = true;
    }

    // eslint-disable-next-line react/sort-comp
    onTextUpdate = (text: string) => {
        const {clear, onTextUpdate} = this.props;

        this.setState({text});
        this.loadSuggestions(text);

        if (!text.length) {
            clear?.();
        }

        onTextUpdate?.(text);
    };

    onFocus() {
        // make sure that suggestions popup is visible only if onFocus() invocation was not followed
        // by onClearClick() invocation (which sets the flag to true afterwards), since onFocus event
        // always happen first when any action is made within text input
        this.setState({focused: true});

        this.isClearClicked = false;
        this.loadSuggestions(this.state.text);
        this.skipApplyForNextBlur = false;
    }

    onBlur() {
        this.hideSuggestions();
        if (!this.isClearClicked) {
            this.props.onBlur?.();
        }
        if (!this.skipApplyForNextBlur) {
            this.applySuggestion(this.state.text ?? '');
        }
        this.setState({focused: false});
    }

    onKeyDown(evt: React.KeyboardEvent) {
        const key = evt.keyCode;

        if (key === ARROW_DOWN) {
            evt.preventDefault();
            this.selectNextSuggestion();
        } else if (key === ARROW_UP) {
            evt.preventDefault();
            this.selectPrevSuggestion();
        } else if (key === ENTER) {
            this.applyOrClearSuggestion();
        } else if (key === ESCAPE) {
            this.input.current?.blur();
        }
    }

    hideSuggestions() {
        this.setState({items: [], popupVisible: false, selectedIndex: 0});
        this.props.onOpenChange?.({open: false});
    }

    showSuggestions = (items: SuggestProps['items']) => {
        if (!this.isUnmounting) {
            this.setState({
                items,
                popupVisible: true,
                selectedIndex: 0,
            });
            this.props.onOpenChange?.({open: true});
        }
    };

    loadSuggestions(text?: string) {
        const {filter, items} = this.props;

        Promise.resolve(filter(items, text)).then(this.showSuggestions);
    }

    clearSuggestions() {
        const {clear} = this.props;

        clear?.();
        // update flag value not to show suggestions after function clear() have change input value for ''
        // and on input change event listener will call popup render
        this.isClearClicked = true;

        this.input.current?.blur();
    }

    applySuggestion(text: string) {
        const {apply} = this.props;
        this.setState({text});
        apply?.(text);
        this.input.current?.blur();
    }

    getItemIndex(selectedIndex: number) {
        return selectedIndex - 1;
    }

    getSelectedIndex(itemIndex: number) {
        return itemIndex + 1;
    }

    getItemValue(item: string | Item) {
        return typeof item === 'string' ? item : item.value;
    }

    applyOrClearSuggestion() {
        const {selectedIndex, items} = this.state;

        let item: SuggestItem | undefined;

        if (selectedIndex === 0) {
            if (items.length > 0) {
                item = items[0];
            }
        } else {
            item = items[this.getItemIndex(selectedIndex)];
        }

        if (item) {
            const value = this.getItemValue(item);
            this.applySuggestion(value);
            const {onItemClick} = this.props;
            onItemClick?.(item);
        }
    }

    selectPrevSuggestion() {
        const {selectedIndex, items} = this.state;
        const prevIndex =
            selectedIndex === 0 ? this.getSelectedIndex(items.length - 1) : selectedIndex - 1;
        this.setState({selectedIndex: prevIndex});
    }

    selectNextSuggestion() {
        const {selectedIndex, items} = this.state;
        const nextIndex =
            selectedIndex === this.getSelectedIndex(items.length - 1) ? 0 : selectedIndex + 1;
        this.setState({selectedIndex: nextIndex});
    }

    renderInput() {
        const {text} = this.state;
        const {placeholder, autoFocus, disabled, pin} = this.props;

        return (
            <TextInput
                hasClear
                value={text}
                className={b('control')}
                placeholder={placeholder}
                disabled={disabled}
                onUpdate={this.onTextUpdate}
                onFocus={this.onFocus}
                onBlur={this.onBlur}
                autoFocus={autoFocus}
                controlRef={this.input}
                pin={pin}
                onKeyDown={this.onKeyDown}
            />
        );
    }

    renderCounter(item: Item) {
        const counter = item.counter;

        return (
            typeof counter !== 'undefined' && <span className={b('item-counter')}>{counter}</span>
        );
    }

    renderSimpleItem(item: string | Item) {
        const text = typeof item === 'string' ? item : item.text;

        return (
            <span>
                {'string' !== typeof item && this.renderCounter(item)}
                {text}
            </span>
        );
    }

    renderItem(
        item: string | Item,
        index: number,
        key: number | string,
        className?: string,
    ): React.ReactElement {
        const {selectedIndex} = this.state;
        const itemClassName = b(
            'item',
            {
                selected: selectedIndex === this.getSelectedIndex(index) ? 'yes' : undefined,
            },
            className,
        );

        const value = this.getItemValue(item);

        const {template, renderItem, onItemClick} = this.props;

        const renderer =
            renderItem ??
            (typeof template !== 'undefined'
                ? templates.get(template.key).__default__
                : this.renderSimpleItem.bind(this));

        return (
            <li
                key={key}
                title={value}
                className={itemClassName}
                onMouseDown={() => {
                    this.skipApplyForNextBlur = true;
                    onItemClick?.(item);
                    this.applySuggestion(value);
                }}
            >
                {renderer(item)}
            </li>
        );
    }

    getInputWidth() {
        // Is there a way to avoid using private _control property?
        return this.input.current ? this.input.current.offsetWidth - 2 : 0;
    }

    restrictItems(items: Array<string | Item>) {
        const {maxItems} = this.props;

        if (_.isNumber(maxItems)) {
            return items.slice(0, maxItems || items.length);
        } else if (_.isObject(maxItems)) {
            const {totalAmount, groupPredicate} = maxItems;
            const [positiveGroup, negativeGroup] = _.partition(items, groupPredicate);
            if (positiveGroup.length && negativeGroup.length) {
                // NOTE: we don't want to one group to be omitted in case there is a large
                // bias towards another group - hence minimum value of 1
                const positiveGroupMaxItems = Math.round(
                    Math.max((positiveGroup.length / items.length) * totalAmount, 1),
                );
                return positiveGroup
                    .slice(0, positiveGroupMaxItems)
                    .concat(negativeGroup.slice(0, totalAmount - positiveGroupMaxItems));
            } else {
                // one group is empty - same case as no groups
                return items.slice(0, totalAmount || items.length);
            }
        } else {
            return items;
        }
    }

    renderSuggestions(items: Array<SuggestItem>) {
        const className = b('wrapper');
        const listClassName = b('items');

        const itemRenderer = (index: number, key: number | string): JSX.Element =>
            this.renderItem(items[index], index, key);

        const showNoItemsMsg = items.length === 0 && this.state.text;
        return (
            items && (
                <div className={className}>
                    {showNoItemsMsg && this.renderItem('No items', -1, 'no_items', b('no-items'))}
                    <ul className={listClassName} style={{minWidth: this.getInputWidth()}}>
                        <ReactList
                            itemRenderer={itemRenderer}
                            length={items.length}
                            type="uniform"
                        />
                    </ul>
                </div>
            )
        );
    }

    renderPopup() {
        const {popupClassName, popupPlacement} = this.props;
        const {popupVisible} = this.state;

        const items = this.restrictItems(this.state.items);
        return (
            <Popup
                className={popupClassName}
                placement={popupPlacement ?? ['bottom-start', 'top-start']}
                anchorRef={this.input}
                // don't show popup with suggestions after clear button click
                open={!this.isClearClicked && popupVisible && items.length > 0}
                onClose={this.hideSuggestions}
            >
                {this.renderSuggestions(items)}
            </Popup>
        );
    }

    render() {
        const {className} = this.props;
        return (
            <div className={b(null, className)}>
                {this.renderInput()}
                {this.renderPopup()}
            </div>
        );
    }
}
