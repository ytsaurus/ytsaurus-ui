import {Popup} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import templates from '../templates/templates';
import './Dropdown.scss';

const block = cn('yt-dropdown');

class Dropdown extends Component {
    static propTypes = {
        button: PropTypes.oneOfType([PropTypes.element, PropTypes.object]).isRequired,
        className: PropTypes.string,
        popup: PropTypes.object,
        directions: PropTypes.array,
        trigger: PropTypes.oneOf(['click', 'hover']).isRequired,
        template: PropTypes.oneOfType([
            PropTypes.element,
            PropTypes.shape({
                key: PropTypes.string.isRequired,
                data: PropTypes.object,
            }),
        ]).isRequired,
        zIndexGroupLevel: PropTypes.number,
    };

    static defaultProps = {
        zIndexGroupLevel: 1,
        directions: ['bottom-end', 'top-end'],
    };

    state = {
        popupVisible: false,
    };

    anchor = React.createRef();

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
        const {key, data} = this.props.template;
        const renderer = templates.get(key).__default__;

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

    render() {
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
