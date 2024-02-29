import React from 'react';
import key from 'hotkeys-js';
import PropTypes from 'prop-types';

import {getDisplayName} from '../../../utils';

export default function withScope(scope: string) {
    return function wrap<P>(Component: React.ComponentType<P>) {
        type Props = P & {visible: true};
        return class WithScope extends React.Component<Props> {
            static propTypes = {
                visible: PropTypes.bool.isRequired,
            };

            static displayName = `WithScope(${getDisplayName(Component)})`;

            prevScope = '';

            componentDidMount() {
                this.prevScope = key.getScope();

                if (this.props.visible) {
                    key.setScope(scope);
                }
            }

            componentDidUpdate(prevProps: Props) {
                const {visible: prevVisible} = prevProps;
                const {visible} = this.props;

                if (prevVisible !== visible) {
                    if (visible) {
                        this.prevScope = key.getScope();
                        key.setScope(scope);
                    } else {
                        key.setScope(this.prevScope);
                    }
                }
            }

            componentWillUnmount() {
                key.setScope(this.prevScope);
            }

            render() {
                return <Component {...this.props} />;
            }
        };
    };
}
