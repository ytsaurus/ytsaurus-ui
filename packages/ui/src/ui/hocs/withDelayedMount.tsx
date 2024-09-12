import React from 'react';

/**
 * The hoc allows to delay mounting until `props.visible == true`.
 * The hoc might be useful to wrap components wrapped by React.lazy
 * @param Component
 * @returns
 */
export function withDelayedMount<P extends {visible?: boolean}>(Component: React.ComponentType<P>) {
    return function MountOnFirstVisible(props: P) {
        const [mounted, setMounted] = React.useState(false);
        React.useEffect(() => {
            if (!mounted && props.visible) {
                setMounted(true);
            }
        }, [props.visible, mounted]);
        return !mounted ? null : <Component {...props} />;
    };
}
