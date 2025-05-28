import key from 'hotkeys-js';
import React from 'react';

export function useHotkeysScope(scope: string, visible: boolean) {
    React.useEffect(() => {
        if (!visible) {
            return undefined;
        }

        const prevScope = key.getScope();
        key.setScope(scope);

        return () => {
            key.setScope(prevScope);
        };
    }, [scope, visible]);
}

export function UseHotkeysScope({visible, scope}: {visible: boolean; scope: string}) {
    useHotkeysScope(scope, visible);

    return null;
}
