import React from 'react';
import ReactDOM from 'react-dom';
import block from 'bem-cn-lite';
import {MobileContentContainer} from './ModalContent';

import './MobileModal.scss';

const b = block('yc-mobile-modal');

export interface MobileModalProps {
    onClose?: () => void;
    visible: boolean;
    id?: string;
    title?: string;
    className?: string;
    contentClassName?: string;
    swipeAreaClassName?: string;
    allowHideOnContentScroll?: boolean;
    children: React.ReactNode;
}

interface MobileModalState {
    visible: boolean;
}

export class MobileModal extends React.Component<MobileModalProps, MobileModalState> {
    private static bodyScrollLocksCount = 0;
    private static bodyInitialOverflow: string | undefined = undefined;

    static lockBodyScroll() {
        if (++MobileModal.bodyScrollLocksCount === 1) {
            MobileModal.bodyInitialOverflow = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
        }
    }

    static restoreBodyScroll() {
        if (MobileModal.bodyScrollLocksCount === 0) {
            return;
        }

        if (--MobileModal.bodyScrollLocksCount === 0) {
            document.body.style.overflow = MobileModal.bodyInitialOverflow || '';
            MobileModal.bodyInitialOverflow = undefined;
        }
    }

    bodyScrollLocked = false;

    state: MobileModalState = {
        visible: false,
    };

    componentDidMount() {
        if (this.props.visible) {
            this.showModal();
        }
    }

    componentDidUpdate(prevProps: MobileModalProps) {
        if (!prevProps.visible && this.props.visible) {
            this.showModal();
        }
    }

    componentWillUnmount() {
        this.restoreBodyScroll();
    }

    lockBodyScroll() {
        MobileModal.lockBodyScroll();
        this.bodyScrollLocked = true;
    }

    restoreBodyScroll() {
        if (!this.bodyScrollLocked) {
            return;
        }

        MobileModal.restoreBodyScroll();
        this.bodyScrollLocked = false;
    }

    render(): React.ReactElement | null {
        if (!this.state.visible) {
            return <></>;
        }

        return <>{ReactDOM.createPortal(this.renderModal(), document.body)}</>;
    }

    private renderModal() {
        const {
            id,
            children,
            className,
            contentClassName,
            swipeAreaClassName,
            title,
            visible,
            allowHideOnContentScroll,
        } = this.props;

        return (
            <div className={b(null, className)}>
                <MobileContentContainer
                    id={id}
                    content={children}
                    contentClassName={contentClassName}
                    swipeAreaClassName={swipeAreaClassName}
                    title={title}
                    visible={visible}
                    allowHideOnContentScroll={allowHideOnContentScroll}
                    hideModal={this.hideModal}
                />
            </div>
        );
    }

    private showModal = () => {
        this.lockBodyScroll();
        this.setState({visible: true});
    };

    private hideModal = () => {
        this.restoreBodyScroll();

        if (this.props.onClose) {
            this.props.onClose();
        }

        this.setState({visible: false});
    };
}
