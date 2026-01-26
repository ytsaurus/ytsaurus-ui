import React, {Component} from 'react';
import PropTypes from 'prop-types';
import block from 'bem-cn-lite';

import map_ from 'lodash/map';

import {Button, ButtonProps, DropdownMenu} from '@gravity-ui/uikit';

import Icon from '../Icon/Icon';
import Hotkey from '../../components/Hotkey/Hotkey';

import './Favourites.scss';

const b = block('favourites');

interface Props {
    className?: string;
    isActive: boolean;
    items: Array<FavouritesItem>;
    onItemClick: (item: FavouritesItem) => void;
    toggleDisabled?: boolean;
    onToggle: () => void;
    theme?: 'clear';
}

export interface FavouritesItem {
    path: string;
}

interface State {
    isActive: boolean;
}

export default class Favourites extends Component<Props, State> {
    static itemType = PropTypes.shape({
        path: PropTypes.string,
    });

    static propTypes = {
        isActive: PropTypes.bool.isRequired,
        items: PropTypes.arrayOf(Favourites.itemType),
        onItemClick: PropTypes.func,
        toggleDisabled: PropTypes.bool,
        onToggle: PropTypes.func,
        className: PropTypes.string,
        theme: PropTypes.string,
    };

    static getDerivedStateFromProps(props: Props, state: State) {
        if (props.isActive !== state.isActive) {
            return {isActive: props.isActive};
        }
        return null;
    }

    state = {
        isActive: this.props.isActive,
    };

    toggleActive = () => {
        const {onToggle} = this.props;

        this.setState((prevState) => ({isActive: !prevState.isActive}));
        onToggle();
    };

    onItemClick = (item: FavouritesItem) => {
        const {onItemClick} = this.props;
        onItemClick(item);
    };

    renderDropDownMenu() {
        const {items} = this.props;

        const dropItems = map_(items, (item) => {
            return {
                text: item.path,
                action: () => this.onItemClick(item),
            };
        });
        if (items.length === 0) {
            dropItems.push({
                action: () => {},
                text: 'No favourites',
            });
        }

        const switcher = this.renderButton({
            view: 'normal',
            size: 'm',
            pin: 'brick-round',
            title: 'View favourites',
            children: <Icon awesome="angle-down" size={13} />,
        });

        return (
            <DropdownMenu
                popupProps={{
                    className: b('popup', {empty: items.length === 0}),
                }}
                items={dropItems}
                switcher={switcher}
            />
        );
    }

    renderHotkey() {
        return <Hotkey settings={[{keys: 'f', handler: this.toggleActive, scope: 'all'}]} />;
    }

    renderButton(buttonProps: ButtonProps & {disabled?: boolean}) {
        const {theme} = this.props;
        const themeProps = !theme ? {} : {view: 'outlined' as const};
        return <Button {...buttonProps} {...themeProps} />;
    }

    render() {
        const {toggleDisabled, className, theme} = this.props;
        const {isActive} = this.state;

        return (
            <div className={b(null, className)}>
                <div className={b('star-btn', {clear: theme === 'clear'})}>
                    {this.renderButton({
                        view: 'outlined-info',
                        selected: isActive,
                        size: 'm',
                        pin: theme === 'clear' ? 'round-brick' : 'round-clear',
                        title: 'Add to favourites [F]',
                        onClick: this.toggleActive,
                        disabled: toggleDisabled,
                        children: <Icon awesome={isActive ? 'star-alt' : 'star'} size={13} />,
                    })}
                </div>
                {this.renderDropDownMenu()}
                {this.renderHotkey()}
            </div>
        );
    }
}
