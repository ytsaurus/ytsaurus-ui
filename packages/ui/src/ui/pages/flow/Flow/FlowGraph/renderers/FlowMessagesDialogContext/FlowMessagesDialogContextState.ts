import React from 'react';

import {type FlowMessageType} from '../../../../../../../shared/yt-types';

export type FlowMessagesDialogData = Array<FlowMessageType>;

type FlowMessagesDialogContextValue = {
    data: FlowMessagesDialogData | undefined;
    setVisibleMessages: (data?: FlowMessagesDialogData) => void;
};

export const FlowMessagesDialogCtx = React.createContext<FlowMessagesDialogContextValue>({
    data: undefined,
    setVisibleMessages: () => {},
});

export function useFlowMessagesDialogContext() {
    const {setVisibleMessages} = React.useContext(FlowMessagesDialogCtx);
    return {setVisibleMessages};
}
