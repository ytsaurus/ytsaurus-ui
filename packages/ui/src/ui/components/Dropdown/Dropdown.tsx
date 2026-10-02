import {Popup, type PopupProps} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import React, {Component} from 'react';
import templates from '../templates/templates';
import './Dropdown.scss';

const block = cn('yt-dropdown');

export type DropdownProps = {
    button: React.ReactElement<React.HTMLAttributes<HTMLElement>>;
    className?: string;
    popup?: Partial<PopupProps>;
    directions?: PopupProps['placement'][];
    trigger: 'click' | 'hover';
    template: React.ReactElement | {key: string; data?: object};
    zIndexGroupLevel?: number;
};

class Dropdown extends Component<DropdownProps, {popupVisible: boolean}> {
    static defaultProps = {
        zIndexGroupLevel: 1,
        directions: ['bottom-end', 'top-end'] as PopupProps['placement'][],
    };

    override state = {
        popupVisible: false,
    };

    anchor = React.createRef<HTMLSpanElement>();

    toggle = () =>
        this.setState((prevState) => ({
            popupVisible: !prevState.popupVisible,
        }));

    open = () => this.setState({popupVisible: true});

    close = () => this.setState({popupVisible: false});

    renderButton() {
        const {button, trigger} = this.props;

        const actionProps = {
            onClick: trigger === 'click' ? this.toggle : undefined,
            onMouseEnter: trigger === 'hover' ? this.open : undefined,
            onMouseLeave: trigger === 'hover' ? this.close : undefined,
        };

        return React.cloneElement(button, actionProps);
    }

    renderTemplate() {
        const {template} = this.props;
        const {key, data} = this.props.template as {key: string; data?: object};
        const renderer = templates.get<{
            __default__: (this: Dropdown, data?: object) => React.ReactNode;
        }>(key).__default__;

        return React.isValidElement(template)
            ? React.cloneElement(template)
            : renderer.call(this, data);
    }

    renderPopup() {
        const {popup, directions} = this.props;

        return (
            <Popup
                placement={directions?.[0] || 'bottom'}
                onOpenChange={(open) => {
                    if (!open) {
                        this.close();
                    }
                }}
                open={true}
                anchorElement={this.anchor.current}
                {...popup}
            >
                <div className={block('popup-content')}>{this.renderTemplate()}</div>
            </Popup>
        );
    }

    override render() {
        const {className} = this.props;

        return (
            <span className={block(null, className)} ref={this.anchor}>
                {this.renderButton()}
                {this.state.popupVisible && this.renderPopup()}
            </span>
        );
    }
}

export default Dropdown;
