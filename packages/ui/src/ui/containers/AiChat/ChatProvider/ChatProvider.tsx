import React, {createContext, useContext} from 'react';
import {useChatRequest} from './useChatRequest';

const Context = createContext<ReturnType<typeof useChatRequest> | undefined>(undefined);

export function useChatController() {
    const controller = useContext(Context);
    if (!controller) throw new Error('ChatProvider is required');
    return controller;
}

type ChatProviderProps = {children?: React.ReactNode};

export default function ChatProvider({children}: ChatProviderProps) {
    const controller = useChatRequest();
    return <Context.Provider value={controller}>{children}</Context.Provider>;
}
