import React from 'react';
import ReactDOM from 'react-dom';

import {getDisplayName} from '../utils';
import {SPLIT_PANE_ID} from '../constants/index';

export default function withSplit(Component) {
    return class WithSplit extends React.Component {
        static displayName = `WithSplit(${getDisplayName(Component)})`;

        render() {
            return ReactDOM.createPortal(
                <Component {...this.props} />,
                document.getElementById(SPLIT_PANE_ID),
            );
        }
    };
}
