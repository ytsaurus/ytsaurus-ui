import React, {Component} from 'react';
import block from 'bem-cn-lite';

import {Modal as ModalImpl} from '@gravity-ui/uikit';
import Icon from '../Icon/Icon';

import withHandledScrollBar from '../../hocs/components/Modal/withHandledScrollBar';

import './Modal.scss';
import Button, {ButtonProps} from '../Button/Button';

const b = block('elements-modal');

interface ModalProps {
    className?: string;
    visible?: boolean;
    loading?: boolean;
    title?: string;
    size?: 's' | 'm' | 'l';
    borderless?: boolean;
    onConfirm?: () => void;
    isConfirmDisabled?: () => boolean;
    onCancel: () => void;
    renderCustomCancel?: (className: string) => React.ReactNode;
    renderCustomConfirm?: (className: string) => React.ReactNode;
    confirmText?: string;
    confirmTheme?: ButtonProps['view'];
    content?: React.ReactNode;
    footer?: boolean;
    footerContent?: React.ReactNode;
    onOutsideClick?: () => void;
    contentClassName?: string;
}

class Modal extends Component<ModalProps> {
    static defaultProps = {
        borderless: false,
        visible: false,
        loading: false,
        autoclosable: false,
        confirmTheme: 'action',
        footer: true,
        size: 'm',
        confirmText: 'Apply',
    };

    _isConfirmDisabled = () => {
        const {isConfirmDisabled} = this.props;
        return typeof isConfirmDisabled === 'function' && isConfirmDisabled();
    };

    renderHeader() {
        const {title, onCancel} = this.props;
        return (
            <div className={b('header', 'elements-ellipsis')} title={title}>
                {title}
                <div className={b('close')}>
                    <Button view="flat-secondary" size="l" onClick={onCancel}>
                        <Icon awesome={'times'} face={'light'} />
                    </Button>
                </div>
            </div>
        );
    }

    renderContent() {
        const {borderless, contentClassName} = this.props;
        const className = b(
            'body',
            {
                borderless: borderless ? 'yes' : undefined,
            },
            contentClassName,
        );
        return <div className={className}>{this.props.content}</div>;
    }

    renderErrors() {
        return null;
    }

    renderConfirmButton(className: string) {
        const {renderCustomConfirm, loading, confirmText, confirmTheme} = this.props;

        if (typeof renderCustomConfirm === 'function') {
            return renderCustomConfirm(className);
        } else {
            return (
                <Button
                    view={confirmTheme}
                    loading={loading}
                    disabled={this._isConfirmDisabled()}
                    className={className}
                    onClick={this.props.onConfirm}
                    qa="modal-confirm"
                >
                    {confirmText}
                </Button>
            );
        }
    }

    renderCancelButton(className: string) {
        const {renderCustomCancel, onCancel} = this.props;

        if (typeof renderCustomCancel === 'function') {
            return renderCustomCancel(className);
        } else {
            return (
                <Button title="Cancel" className={className} onClick={onCancel}>
                    Cancel
                </Button>
            );
        }
    }

    renderFooter() {
        const {footer, footerContent} = this.props;
        const btnClassName = b('footer-button');

        return (
            footer && (
                <div className={b('footer')}>
                    <div className={b('footer-left')}>{footerContent}</div>
                    <div className={b('footer-right')}>
                        {this.renderCancelButton(btnClassName)}
                        {this.renderConfirmButton(btnClassName)}
                    </div>
                </div>
            )
        );
    }

    render() {
        const {visible, onOutsideClick, size, className} = this.props;
        return (
            <ModalImpl open={visible} onClose={onOutsideClick}>
                <div className={b('wrapper', {size}, className)}>
                    {this.renderHeader()}
                    {this.renderContent()}
                    {this.renderErrors()}
                    {this.renderFooter()}
                </div>
            </ModalImpl>
        );
    }
}

export default withHandledScrollBar(Modal);

export const ModalWithoutHandledScrollBar = Modal;
