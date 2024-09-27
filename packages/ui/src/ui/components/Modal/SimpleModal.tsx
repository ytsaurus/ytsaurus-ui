import React, {Component} from 'react';
import block from 'bem-cn-lite';

import Icon from '../Icon/Icon';

import {Button, Loader, Modal as ModalImpl} from '@gravity-ui/uikit';

import withHandledScrollBar from '../../hocs/components/Modal/withHandledScrollBar';

import './Modal.scss';

const b = block('elements-modal');

interface SimpleModalProps {
    visible?: boolean;
    loading?: boolean;
    title?: string;
    size?: 's' | 'm' | 'l';
    borderless?: boolean;
    onCancel: () => void;
    children?: React.ReactNode;
    onOutsideClick?: () => void;
    className?: string;
    wrapperClassName?: string;
}

class SimpleModal extends Component<SimpleModalProps> {
    static defaultProps = {
        borderless: false,
        visible: false,
        loading: false,
        autoclosable: false,
        footer: true,
        size: 'm',
    };

    renderHeader() {
        const {title, onCancel, className} = this.props;
        return (
            <div className={b('header', {mix: className})} title={title}>
                {title}
                <div className={b('close')}>
                    <Button
                        qa="simple-modal-close"
                        view="flat-secondary"
                        size="l"
                        onClick={onCancel}
                    >
                        <Icon awesome="times" face="light" />
                    </Button>
                </div>
            </div>
        );
    }

    renderLoader() {
        return (
            <div className={b('loader')}>
                <Loader size="l" className="loader" />
            </div>
        );
    }

    renderContent() {
        const {borderless, loading, children, className} = this.props;
        const contentClassName = b(
            'body',
            {
                borderless: borderless && 'yes',
                mix: className,
            },
            'pretty-scroll',
        );
        return <div className={contentClassName}>{loading ? this.renderLoader() : children}</div>;
    }

    render() {
        const {visible, onOutsideClick, size, className, wrapperClassName} = this.props;
        return (
            visible && (
                <ModalImpl className={className} open={visible} onClose={onOutsideClick}>
                    <div className={b('wrapper', {size}, wrapperClassName)}>
                        {this.renderHeader()}
                        {this.renderContent()}
                    </div>
                </ModalImpl>
            )
        );
    }
}

export default withHandledScrollBar(SimpleModal);
