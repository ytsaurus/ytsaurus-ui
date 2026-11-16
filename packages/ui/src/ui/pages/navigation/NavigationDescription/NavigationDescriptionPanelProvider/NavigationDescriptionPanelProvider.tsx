import React, {createContext, useCallback, useContext, useState} from 'react';
import {useSidePanel} from '../../../../hooks/use-side-panel';
import {
    type DescriptionSnapshot,
    NavigationDescriptionPanel,
} from '../NavigationDescriptionPanel/NavigationDescriptionPanel';

const DescriptionPanelContext = createContext<
    {toggle: (description: DescriptionSnapshot) => void; isOpen: boolean} | undefined
>(undefined);

export function useDescriptionPanel() {
    const panel = useContext(DescriptionPanelContext);
    if (!panel) {
        throw new Error('NavigationDescriptionPanelProvider is missing');
    }
    return panel;
}

export function NavigationDescriptionPanelProvider({children}: {children: React.ReactNode}) {
    const [description, setDescription] = useState<DescriptionSnapshot>();
    const {openWidget, closeWidget, widgetOpened, widgetContent} = useSidePanel(
        'navigation-description',
        {
            confirmReplacement: true,
            renderContent: ({onClose}) =>
                description && <NavigationDescriptionPanel {...description} onClose={onClose} />,
        },
    );
    const toggle = useCallback(
        (snapshot: DescriptionSnapshot) => {
            if (widgetOpened) {
                closeWidget();
                return;
            }
            openWidget(() => setDescription(snapshot));
        },
        [openWidget, closeWidget, widgetOpened],
    );

    return (
        <DescriptionPanelContext.Provider value={{toggle, isOpen: widgetOpened}}>
            {children}
            {widgetContent}
        </DescriptionPanelContext.Provider>
    );
}
