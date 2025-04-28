import React from 'react';

export const ScrollableElementContext = React.createContext<HTMLElement | undefined>(undefined);

export function useScrollableElementContenxt() {
    const value = React.useContext(ScrollableElementContext);
    return value;
}
