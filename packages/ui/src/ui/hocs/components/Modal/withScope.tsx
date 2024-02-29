import React from 'react';

import {getDisplayName} from '../../../utils';
import {useHotkeysScope} from '../../../hooks/use-hotkeysjs-scope';

export default function withScope(scope: string) {
    return function wrap<P>(Component: React.ComponentType<P>) {
        type Props = P & {visible: true};
        const ResComponent: React.FC<Props> = function WithScope(props) {
            useHotkeysScope(scope, props.visible);
            return <Component {...props} />;
        };

        ResComponent.displayName = `WithScope(${getDisplayName(Component)})`;
        return ResComponent;
    };
}
