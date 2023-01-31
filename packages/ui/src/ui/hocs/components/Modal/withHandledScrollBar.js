import React from 'react';
import PropTypes from 'prop-types';

import {getDisplayName} from '../../../utils';

export default function withHandledScrollBar(Component) {
    return class WithHandledScrollBar extends React.Component {
        static propTypes = {
            visible: PropTypes.bool.isRequired,
        };

        static displayName = `WithHandledScrollBar(${getDisplayName(Component)})`;

        componentDidMount() {
            if (this.props.visible) {
                this.setOpenedStyle();
            }
        }

        componentDidUpdate(prevProps) {
            const {visible: prevVisible} = prevProps;
            const {visible} = this.props;

            if (prevVisible !== visible) {
                if (visible) {
                    this.setOpenedStyle();
                } else {
                    this.setClosedStyle();
                }
            }
        }

        componentWillUnmount() {
            this.setClosedStyle();
        }

        setOpenedStyle() {
            const prevWindowWidth = document.body.clientWidth;
            document.body.style.overflow = 'hidden';
            const newWindowWidth = document.body.clientWidth;

            if (newWindowWidth !== prevWindowWidth) {
                document.body.style.paddingRight = newWindowWidth - prevWindowWidth + 'px';
            }
        }

        setClosedStyle() {
            document.body.style.overflow = '';
            document.body.style.paddingRight = 0;
        }

        render() {
            return <Component {...this.props} />;
        }
    };
}
