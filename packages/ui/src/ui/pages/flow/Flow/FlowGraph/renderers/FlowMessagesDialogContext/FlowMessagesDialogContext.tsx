import cn from 'bem-cn-lite';
import React from 'react';
import {DialogWrapper} from '../../../../../../components/DialogWrapper/DialogWrapper';
import {FlowMessagesContent, type FlowMessagesProps} from '../FlowGraphRenderer';
import '../FlowGraphRenderer.scss';

const block = cn('yt-flow-graph-renderer');

type FlowMessagesDialogContextValue = {
    data: FlowMessagesProps['data'];
    setVisibleMessages: (data?: FlowMessagesProps['data']) => void;
};

const FlowMessagesDialogCtx = React.createContext<FlowMessagesDialogContextValue>({
    data: undefined,
    setVisibleMessages: () => {},
});

export function useFlowMessagesDialogContext() {
    const {setVisibleMessages} = React.useContext(FlowMessagesDialogCtx);
    return {setVisibleMessages};
}

export function FlowMessagesDialogContext({children}: {children: React.ReactNode}) {
    const [data, setVisibleMessages] = React.useState<FlowMessagesProps['data']>();
    return (
        <FlowMessagesDialogCtx.Provider value={{data, setVisibleMessages}}>
            {children}
            {data && (
                <DialogWrapper
                    className={block('messages-dialog')}
                    open={true}
                    onClose={() => setVisibleMessages(undefined)}
                >
                    <DialogWrapper.Header caption="Messages" />
                    <DialogWrapper.Body className={block('messages-body')}>
                        <FlowMessagesContent data={data} />
                    </DialogWrapper.Body>
                </DialogWrapper>
            )}
        </FlowMessagesDialogCtx.Provider>
    );
}
