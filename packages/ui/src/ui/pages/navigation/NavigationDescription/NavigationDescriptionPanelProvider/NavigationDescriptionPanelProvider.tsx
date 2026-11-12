import React, {createContext, useCallback, useContext, useState} from 'react';
import {useSidePanel} from '../../../../hooks/use-side-panel';
import {NavigationDescriptionPanel} from '../NavigationDescriptionPanel/NavigationDescriptionPanel';

type DescriptionSnapshot = {
    description: string;
    path: string;
    cluster: string;
    inheritedPath?: string;
};

const DescriptionPanelContext = createContext<
    ((description: DescriptionSnapshot) => void) | undefined
>(undefined);

export function useOpenDescriptionPanel() {
    const open = useContext(DescriptionPanelContext);
    if (!open) {
        throw new Error('NavigationDescriptionPanelProvider is missing');
    }
    return open;
}

export function NavigationDescriptionPanelProvider({children}: {children: React.ReactNode}) {
    const [description, setDescription] = useState<DescriptionSnapshot>();
    const {openWidget, widgetContent} = useSidePanel('navigation-description', {
        confirmReplacement: true,
        renderContent: ({onClose}) =>
            description && <NavigationDescriptionPanel {...description} onClose={onClose} />,
    });
    const open = useCallback(
        (snapshot: DescriptionSnapshot) => {
            openWidget(() => setDescription(snapshot));
        },
        [openWidget],
    );

    return (
        <DescriptionPanelContext.Provider value={open}>
            {children}
            {widgetContent}
        </DescriptionPanelContext.Provider>
    );
}
