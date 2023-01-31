import React from 'react';
import PropTypes from 'prop-types';

import {getDisplayName} from '../utils';

export interface WithVisibleProps {
    visible?: boolean;
    handleShow: () => void;
    handleClose: () => void;
    toggleVisible: () => void;
}

export interface State {
    visible?: boolean;
}

export default function withVisible<P extends WithVisibleProps>(Component: React.ComponentType<P>) {
    const ResComponent = class WithVisible extends React.Component<P, State> {
        static propTypes = {
            visible: PropTypes.bool,
        };

        static defaultProps = {
            visible: false,
        };

        static displayName = `WithVisible(${getDisplayName(Component)})`;

        state = {visible: this.props.visible};

        handleShow = () => this.setState({visible: true});
        handleClose = () => this.setState({visible: false});
        toggleVisible = () => this.setState((prevState) => ({visible: !prevState.visible}));

        render() {
            const {visible} = this.state;

            return (
                <Component
                    {...this.props}
                    visible={visible}
                    handleShow={this.handleShow}
                    handleClose={this.handleClose}
                    toggleVisible={this.toggleVisible}
                />
            );
        }
    };
    return ResComponent as any as React.ComponentClass<P, State>;
}
