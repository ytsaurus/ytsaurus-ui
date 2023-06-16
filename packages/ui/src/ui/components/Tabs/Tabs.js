import React, {Component} from 'react';
import {NavLink} from 'react-router-dom';
import PropTypes from 'prop-types';
import block from 'bem-cn-lite';

import Hotkey from '../Hotkey/Hotkey';
import Link from '../Link/Link';
import Icon from '../Icon/Icon';

import action from '../action/action';

import './Tabs.scss';
import {makeRoutedURL} from '../../store/location';

const b = block('tabs');

const propTypes = {
    items: PropTypes.arrayOf(
        PropTypes.shape({
            value: PropTypes.string.isRequired,
            text: PropTypes.string.isRequired,
            counter: PropTypes.number,
            show: PropTypes.bool,
            title: PropTypes.string,
            url: PropTypes.string,
            routed: PropTypes.bool,
            external: PropTypes.bool,
        }),
    ).isRequired,
    active: PropTypes.string,
    getTabLink: PropTypes.func,
    onTabChange: PropTypes.func,
    isLink: PropTypes.bool,
    layout: PropTypes.oneOf(['horizontal', 'vertical']),
    size: PropTypes.oneOf(['s', 'm', 'l']),
    underline: PropTypes.bool,
    routed: PropTypes.bool,
    routedPreserveLocation: PropTypes.bool,
    exactNavLink: PropTypes.bool,
    className: PropTypes.string,
};

const defaultProps = {
    underline: false,
    routed: false,
    layout: 'horizontal',
};

class Tabs extends Component {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.storeMouseContext = this.storeMouseContext.bind(this);
        this.onSameMouseContext = this.onSameMouseContext.bind(this);
    }

    renderCounter(item) {
        const {size} = this.props;
        const className = b('tab-counter', {size});
        return (
            typeof item.counter !== 'undefined' && <span className={className}>{item.counter}</span>
        );
    }

    renderHotkey(item) {
        return item.hotkey && <Hotkey settings={item.hotkey} />;
    }

    storeMouseContext(event) {
        this.mouseContext = {
            target: event.currentTarget,
            button: event.button,
        };
    }

    onSameMouseContext(clickHandler) {
        return (event) => {
            const context = this.mouseContext;
            if (
                context &&
                event.currentTarget === context.target &&
                event.button === context.button
            ) {
                clickHandler(event);
            }
        };
    }

    renderNavLink(item) {
        const to = !this.props.routedPreserveLocation
            ? item.url
            : () => {
                  return makeRoutedURL(item.url);
              };

        return (
            <NavLink to={to} exact={this.props.exactNavLink}>
                {item.text}
            </NavLink>
        );
    }

    renderLink(item) {
        const {active, getTabLink, isLink} = this.props;

        // NOTE: onTabChange has a priority over getTabLink in action.makeEntryClickHandler - in case tabs correspond
        // links, do not pass onTabChange at all - so it won't get called.
        const onTabChange = !isLink && this.props.onTabChange;
        const onTabClick = (evt) => {
            const clickHandler = action.makeEntryClickHandler(evt, onTabChange, getTabLink);
            clickHandler(item.value);
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

    renderTab(item) {
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

        return (
            <ul className={className}>
                {items.map((item) => {
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

    render() {
        const {className} = this.props;

        return (
            <div className={b(null, className)}>
                {this.renderList()}
                {this.renderUnderline()}
            </div>
        );
    }
}

export function TabsHorizontal(props) {
    return <Tabs {...props} layout={'horizontal'} />;
}

export default Tabs;
