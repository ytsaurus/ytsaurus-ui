import React from 'react';
import block from 'bem-cn-lite';
import {
    MobileContextProps,
    Platform,
    withMobile,
    History,
    Location,
    getComponentName,
} from '@gravity-ui/uikit';
import {VelocityTracker} from './utils';

import './MobileModal.scss';

const b = block('yc-mobile-modal');
const DEFAULT_TRANSITION_DURATION = '0.3s';
const HIDE_THRESHOLD = 50;
const ACCELERATION_Y_MAX = 0.08;
const ACCELERATION_Y_MIN = -0.02;

let hashHistory: string[] = [];

type Status = 'showing' | 'hiding';

interface ModalContentBaseProps {
    hideModal: () => void;
    content: React.ReactNode;
    visible: boolean;
    id?: string;
    title?: string;
    contentClassName?: string;
    swipeAreaClassName?: string;
}

interface ModalContentDefaultProps {
    id: string;
    allowHideOnContentScroll: boolean;
}

type ModalContentProps = ModalContentBaseProps & Partial<ModalContentDefaultProps>;

interface RouteComponentProps {
    history: History;
    location: Location;
}

type ModalContentInnerProps = ModalContentProps &
    RouteComponentProps &
    Omit<MobileContextProps, 'useHistory' | 'useLocation'>;

interface ModalContentState {
    startScrollTop: number;
    startY: number;
    deltaY: number;
    prevInnerContentHeight: number;
    swipeAreaTouched: boolean;
    contentTouched: boolean;
    veilTouched: boolean;
    isAnimating: boolean;
    inWindowResizeScope: boolean;
}

class ModalContent extends React.Component<ModalContentInnerProps, ModalContentState> {
    static defaultProps: ModalContentDefaultProps = {
        id: 'modal',
        allowHideOnContentScroll: true,
    };

    veilRef = React.createRef<HTMLDivElement>();
    modalRef = React.createRef<HTMLDivElement>();
    modalTopRef = React.createRef<HTMLDivElement>();
    modalContentRef = React.createRef<HTMLDivElement>();
    modalInnerContentRef = React.createRef<HTMLDivElement>();
    velocityTracker = new VelocityTracker();
    observer: MutationObserver | null = null;
    transitionDuration = DEFAULT_TRANSITION_DURATION;

    state: ModalContentState = {
        startScrollTop: 0,
        startY: 0,
        deltaY: 0,
        prevInnerContentHeight: 0,
        swipeAreaTouched: false,
        contentTouched: false,
        veilTouched: false,
        isAnimating: false,
        inWindowResizeScope: false,
    };

    componentDidMount() {
        this.addListeners();
        this.show();
        this.setInitialStyles();
        this.setState({prevInnerContentHeight: this.innerContentHeight});
    }

    componentDidUpdate(prevProps: ModalContentInnerProps) {
        const {visible, location} = this.props;

        if (!prevProps.visible && visible) {
            this.show();
        }

        if ((prevProps.visible && !visible) || this.shouldClose(prevProps)) {
            this.hide();
        }

        if (prevProps.location.pathname !== location.pathname) {
            hashHistory = [];
        }
    }

    componentWillUnmount() {
        this.removeListeners();
    }

    render() {
        const {content, contentClassName, swipeAreaClassName, title} = this.props;

        const {
            deltaY,
            swipeAreaTouched,
            contentTouched,
            veilTouched,
            isAnimating,
            inWindowResizeScope,
        } = this.state;

        const veilTransitionMod = {
            'with-transition': !deltaY || veilTouched,
        };

        const modalTransitionMod = {
            'with-transition': !inWindowResizeScope && veilTransitionMod['with-transition'],
        };

        const contentMod = {
            'without-scroll': (deltaY > 0 && contentTouched) || swipeAreaTouched,
        };

        return (
            <React.Fragment>
                <div
                    ref={this.veilRef}
                    className={b('veil', veilTransitionMod)}
                    onClick={isAnimating ? undefined : this.onVeilClick}
                    onTransitionEnd={this.onVeilTransitionEnd}
                />
                <div ref={this.modalRef} className={b('modal', modalTransitionMod)}>
                    <div ref={this.modalTopRef} className={b('modal-top')}>
                        <div className={b('modal-top-resizer')} />
                    </div>
                    <div
                        className={b('modal-swipe-area', swipeAreaClassName)}
                        onTouchStart={this.onSwipeAreaTouchStart}
                        onTouchMove={this.onSwipeAriaTouchMove}
                        onTouchEnd={this.onSwipeAriaTouchEnd}
                    />
                    <div
                        ref={this.modalContentRef}
                        className={b('modal-content', contentMod, contentClassName)}
                        onTouchStart={this.onContentTouchStart}
                        onTouchMove={this.onContentTouchMove}
                        onTouchEnd={this.onContentTouchEnd}
                        onTransitionEnd={this.onContentTransitionEnd}
                    >
                        {title && <div className={b('modal-content-title')}>{title}</div>}
                        <div ref={this.modalInnerContentRef}>{content}</div>
                    </div>
                </div>
            </React.Fragment>
        );
    }

    private get veilOpacity() {
        return this.veilRef.current?.style.opacity || 0;
    }

    private get modalTopHeight() {
        return this.modalTopRef.current?.getBoundingClientRect().height || 0;
    }

    private get modalHeight() {
        return this.modalRef.current?.getBoundingClientRect().height || 0;
    }

    private get innerContentHeight() {
        return this.modalInnerContentRef.current?.getBoundingClientRect().height || 0;
    }

    private get modalScrollTop() {
        return this.modalContentRef.current?.scrollTop || 0;
    }

    private setInitialStyles() {
        if (this.modalContentRef.current && this.modalInnerContentRef.current) {
            this.transitionDuration = getComputedStyle(
                this.modalContentRef.current,
            ).getPropertyValue('--yc-mobile-modal-transition-duration');

            const initialHeight = this.modalHeight - this.modalTopHeight;
            this.modalContentRef.current.style.height = `${initialHeight}px`;
        }
    }

    private setStyles = ({status, deltaHeight = 0}: {status: Status; deltaHeight?: number}) => {
        if (!this.modalRef.current || !this.veilRef.current) {
            return;
        }

        const visibleHeight = this.modalHeight - deltaHeight;
        const translate =
            status === 'showing'
                ? `translate3d(0, -${visibleHeight}px, 0)`
                : 'translate3d(0, 0, 0)';
        let opacity = 0;

        if (status === 'showing') {
            opacity = deltaHeight === 0 ? 1 : visibleHeight / this.modalHeight;
        }

        this.veilRef.current.style.opacity = String(opacity);

        this.modalRef.current.style.transform = translate;
    };

    private show = () => {
        this.setState({isAnimating: true}, () => {
            this.setStyles({status: 'showing'});
            this.setHash();
        });
    };

    private hide = () => {
        this.setState({isAnimating: true}, () => {
            this.setStyles({status: 'hiding'});
            this.removeHash();
        });
    };

    private onSwipeAreaTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        this.velocityTracker.clear();

        this.setState({
            startY: e.nativeEvent.touches[0].clientY,
            swipeAreaTouched: true,
        });
    };

    private onContentTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        if (!this.props.allowHideOnContentScroll || this.state.swipeAreaTouched) {
            return;
        }

        this.velocityTracker.clear();

        this.setState({
            startY: e.nativeEvent.touches[0].clientY,
            startScrollTop: this.modalScrollTop,
            contentTouched: true,
        });
    };

    private onSwipeAriaTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        const delta = e.nativeEvent.touches[0].clientY - this.state.startY;

        this.velocityTracker.addMovement({
            x: e.nativeEvent.touches[0].clientX,
            y: e.nativeEvent.touches[0].clientY,
        });

        this.setState({deltaY: delta});

        if (delta <= 0) {
            return;
        }

        this.setStyles({status: 'showing', deltaHeight: delta});
    };

    private onContentTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        if (!this.props.allowHideOnContentScroll) {
            return;
        }

        const {startScrollTop, swipeAreaTouched} = this.state;

        if (
            swipeAreaTouched ||
            this.modalScrollTop > 0 ||
            (startScrollTop > 0 && startScrollTop !== this.modalScrollTop)
        ) {
            return;
        }

        const delta = e.nativeEvent.touches[0].clientY - this.state.startY;

        this.velocityTracker.addMovement({
            x: e.nativeEvent.touches[0].clientX,
            y: e.nativeEvent.touches[0].clientY,
        });

        this.setState({deltaY: delta});

        if (delta <= 0) {
            return;
        }

        this.setStyles({status: 'showing', deltaHeight: delta});
    };

    private onTouchEndAction = (deltaY: number) => {
        const accelerationY = this.velocityTracker.getYAcceleration();

        if (this.modalHeight <= deltaY) {
            this.props.hideModal();
        } else if (
            (deltaY > HIDE_THRESHOLD &&
                accelerationY <= ACCELERATION_Y_MAX &&
                accelerationY >= ACCELERATION_Y_MIN) ||
            accelerationY > ACCELERATION_Y_MAX
        ) {
            this.hide();
        } else if (deltaY > 0) {
            this.show();
        }
    };

    private onSwipeAriaTouchEnd = () => {
        const {deltaY} = this.state;

        this.onTouchEndAction(deltaY);

        this.setState({
            startY: 0,
            deltaY: 0,
            swipeAreaTouched: false,
        });
    };

    private onContentTouchEnd = () => {
        const {deltaY, swipeAreaTouched} = this.state;

        if (!this.props.allowHideOnContentScroll || swipeAreaTouched) {
            return;
        }

        this.onTouchEndAction(deltaY);

        this.setState({
            startY: 0,
            deltaY: 0,
            contentTouched: false,
        });
    };

    private onVeilClick = () => {
        this.setState({veilTouched: true});
        this.hide();
    };

    private onVeilTransitionEnd = () => {
        this.setState({isAnimating: false});

        if (this.veilOpacity === '0') {
            this.props.hideModal();
        }
    };

    private onContentTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
        if (e.propertyName === 'height') {
            if (this.modalContentRef.current) {
                this.modalContentRef.current.style.transition = 'none';
            }
        }
    };

    private onResizeWindow = () => {
        this.setState({inWindowResizeScope: true});

        this.onResize();

        setTimeout(() => this.setState({inWindowResizeScope: false}), 0);
    };

    private onResize = () => {
        const heightChanged = this.state.prevInnerContentHeight !== this.innerContentHeight;

        if (!this.modalRef.current || !this.modalContentRef.current || !heightChanged) {
            return;
        }

        this.modalContentRef.current.style.transition =
            this.state.prevInnerContentHeight > this.innerContentHeight
                ? `height 0s ease ${this.transitionDuration}`
                : 'none';

        this.setState({prevInnerContentHeight: this.innerContentHeight});

        this.modalContentRef.current.style.height = `${this.innerContentHeight}px`;
        this.modalRef.current.style.transform = `translate3d(0, -${
            this.innerContentHeight + this.modalTopHeight
        }px, 0)`;
    };

    private addListeners() {
        window.addEventListener('resize', this.onResizeWindow);

        if (this.modalRef.current) {
            const config = {subtree: true, childList: true};
            this.observer = new MutationObserver(this.onResize);
            this.observer.observe(this.modalRef.current, config);
        }
    }

    private removeListeners() {
        window.removeEventListener('resize', this.onResizeWindow);

        if (this.observer) {
            this.observer.disconnect();
        }
    }

    private setHash() {
        const {id, platform, location, history} = this.props;

        if (platform === Platform.BROWSER) {
            return;
        }

        const newLocation = {...location, hash: id};

        switch (platform) {
            case Platform.IOS:
                if (location.hash) {
                    hashHistory.push(location.hash);
                }
                history.replace(newLocation);
                break;
            case Platform.ANDROID:
                history.push(newLocation);
                break;
        }
    }

    private removeHash() {
        const {id, platform, location, history} = this.props;

        if (platform === Platform.BROWSER || location.hash !== `#${id}`) {
            return;
        }

        switch (platform) {
            case Platform.IOS:
                history.replace({...location, hash: hashHistory.pop() ?? ''});
                break;
            case Platform.ANDROID:
                history.goBack();
                break;
        }
    }

    private shouldClose(prevProps: ModalContentInnerProps) {
        const {id, platform, location, history} = this.props;

        return (
            platform !== Platform.BROWSER &&
            history.action === 'POP' &&
            prevProps.location.hash !== location.hash &&
            location.hash !== `#${id}`
        );
    }
}

function withRouterWrapper(Component: React.ComponentType<ModalContentInnerProps>) {
    const C = (props: MobileContextProps & ModalContentProps) => {
        const {useHistory, useLocation, ...remainingProps} = props;
        return <Component {...remainingProps} history={useHistory()} location={useLocation()} />;
    };

    C.displayName = `withRouterWrapper(${getComponentName(Component)})`;
    return C;
}
export const MobileContentContainer = withMobile(withRouterWrapper(ModalContent));
