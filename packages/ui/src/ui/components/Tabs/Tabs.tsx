import React from 'react';
import {NavLink} from 'react-router-dom';
import block from 'bem-cn-lite';
import partition_ from 'lodash/partition';

import Hotkey, {HotkeyProps} from '../Hotkey/Hotkey';
import Link from '../Link/Link';
import Icon from '../Icon/Icon';

import action from '../action/action';
import {makeRoutedURL} from '../../store/location';

import './Tabs.scss';

const b = block('tabs');

interface Props<ValueT extends string = string> {
    className?: string;

    items: Array<TabItem<ValueT>>;
    active?: ValueT;
    onTabChange: (value: ValueT) => void;
    layout?: 'horizontal' | 'vertical';
    size?: 's' | 'm' | 'l';
    underline?: boolean;
    routed?: boolean;
    routedPreserveLocation?: boolean;
    exactNavLink?: boolean;
}

export interface TabItem<ValueT extends string = string> {
    value: ValueT;

    text?: React.ReactNode;
    counter?: number;
    show?: boolean;
    title?: string;
    url?: string;
    routed?: boolean;
    external?: boolean;
    canLeaveTab?: () => boolean;

    hotkey?: HotkeyProps['settings'];
}

class Tabs<ValueT extends string = string> extends React.Component<Props<ValueT>> {
    static defaultProps: Partial<Props> = {
        underline: false,
        routed: false,
        layout: 'horizontal',
    };

    render() {
        const {className} = this.props;

        return (
            <div className={b(null, className)}>
                {this.renderList()}
                {this.renderUnderline()}
            </div>
        );
    }

    renderCounter(item: TabItem<ValueT>) {
        const {size} = this.props;
        const className = b('tab-counter', {size});
        return (
            typeof item.counter !== 'undefined' && <span className={className}>{item.counter}</span>
        );
    }

    renderHotkey(item: TabItem<ValueT>) {
        return item.hotkey && <Hotkey settings={item.hotkey} />;
    }

    renderNavLink(item: TabItem<ValueT>) {
        const to = !this.props.routedPreserveLocation
            ? item.url
            : () => {
                  return makeRoutedURL(item.url!);
              };

        return (
            <NavLink to={to!} exact={this.props.exactNavLink}>
                {item.text}
            </NavLink>
        );
    }

    renderLink(item: TabItem<ValueT>) {
        const {active, onTabChange} = this.props;
        const onTabClick = (evt: React.MouseEvent<Element, MouseEvent>) => {
            const currentItem = this.getCurrentItem();
            const canLeaveTab = currentItem?.canLeaveTab ? currentItem?.canLeaveTab() : true;

            if (canLeaveTab) {
                const clickHandler = action.makeEntryClickHandler(evt, onTabChange);
                clickHandler(item.value);
            }
        };

        return (
            item.show && (
                <Link
                    theme={item.value === active ? 'primary' : 'secondary'}
                    onClick={onTabClick}
                    url={item.url}
                >
                    {item.text}
                    {item.external && (
                        <Icon className={b('external-icon')} awesome="external-link" />
                    )}
                </Link>
            )
        );
    }

    renderTab(item: TabItem<ValueT>) {
        const {size, active, routed} = this.props;

        const className = b('tab', {
            size,
            active: !routed && item.value === active && 'yes',
        });

        const useRoutedLink = item.routed ?? routed;

        return (
            item.show && (
                <li key={item.value} title={item.title} className={className}>
                    {useRoutedLink ? this.renderNavLink(item) : this.renderLink(item)}
                    {this.renderCounter(item)}
                    {this.renderHotkey(item)}
                </li>
            )
        );
    }

    renderList() {
        const {items, layout} = this.props;

        const className = b('list', {layout});

        const [regularItems, externalItems] = partition_(items, (item) => !item.external);

        return (
            <ul className={className}>
                {regularItems.map((item) => {
                    return this.renderTab(item);
                })}
                {externalItems.map((item) => {
                    return this.renderTab(item);
                })}
            </ul>
        );
    }

    renderUnderline() {
        const className = b('underline');

        const {underline, layout} = this.props;

        return underline && layout === 'horizontal' && <div className={className} />;
    }

    getCurrentItem() {
        return this.props.items.find((item) => item.show);
    }
}

export function TabsHorizontal<ValueT extends string = string>(props: Props<ValueT>) {
    return <Tabs {...props} layout={'horizontal'} />;
}

export default Tabs;
