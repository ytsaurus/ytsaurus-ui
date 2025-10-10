import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {useDispatch} from '../store/redux-hooks';
import hoistNonReactStatics from 'hoist-non-react-statics';

import {addNavigationBlocker, removeNavigationBlocker} from '../store/actions/global';
import {getDisplayName} from '../utils';

export default function withBlockedNavigation(Component) {
    const ResComponent = class WithBlockedNavigation extends React.Component {
        static propTypes = {
            addNavigationBlocker: PropTypes.func.isRequired,
            removeNavigationBlocker: PropTypes.func.isRequired,
        };

        static displayName = `WithBlockedNavigation(${getDisplayName(Component)})`;

        render() {
            return (
                <React.Fragment>
                    <BlockNavigation />
                    <Component {...this.props} />
                </React.Fragment>
            );
        }
    };

    // https://reactjs.org/docs/higher-order-components.html#static-methods-must-be-copied-over
    hoistNonReactStatics(ResComponent, Component);

    return connect(null, {addNavigationBlocker, removeNavigationBlocker})(ResComponent);
}

export function BlockNavigation() {
    const dispatch = useDispatch();

    React.useEffect(() => {
        dispatch(addNavigationBlocker());
        return () => {
            dispatch(removeNavigationBlocker());
        };
    });

    return null;
}
