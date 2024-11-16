import React from 'react';
import ReactDOM from 'react-dom';

import {getDisplayName} from '../utils';
import {SPLIT_PANE_ID} from '../constants/index';

export default function withSplit<P>(Component: React.ComponentType<P>): React.ComponentType<P> {
    return class WithSplit extends React.Component<P> {
        static displayName = `WithSplit(${getDisplayName(Component)})`;

        render() {
            return ReactDOM.createPortal(
                <Component {...this.props} />,
                document.getElementById(SPLIT_PANE_ID)!,
            );
        }
    };
}
