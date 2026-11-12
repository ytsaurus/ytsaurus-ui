import React, {useCallback, useEffect, useId, useRef} from 'react';
import {useDispatch, useSelector} from '../store/redux-hooks';
import withSplit from '../hocs/withSplit';
import {closeSidePanel, splitScreen} from '../store/actions/global';
import {useSidePanelConfirmation} from './use-side-panel/use-side-panel-confirmation';

type SidePanelContentProps = {
    paneClassNames?: Array<string>;
    onClose?: () => void;
    confirmReplacement?: boolean;
    renderContent(props: {visible: boolean; onClose: () => void}): React.ReactNode;
};

export const SidePanelPortal = withSplit(SideContent);

export function useSidePanel(name: string, options: SidePanelContentProps) {
    const ownerId = useId();
    const dispatch = useDispatch();
    const optionsRef = useRef(options);
    optionsRef.current = options;
    const widgetOpened = useSelector(
        (state) => state.global.splitScreen.isSplit && state.global.splitScreen.ownerId === ownerId,
    );
    const {requestConfirmation, confirmationDialog} = useSidePanelConfirmation({
        ownerId,
        type: name,
    });

    const openWidget = useCallback(
        (onOpen?: () => void) => {
            const open = () => {
                dispatch(splitScreen(name, optionsRef.current.paneClassNames ?? [], ownerId));
                onOpen?.();
            };
            if (optionsRef.current.confirmReplacement) {
                requestConfirmation(open);
            } else {
                open();
            }
        },
        [dispatch, name, ownerId, requestConfirmation],
    );

    const closeWidget = useCallback(() => {
        dispatch(closeSidePanel(ownerId));
    }, [dispatch, ownerId]);

    useEffect(() => {
        if (!widgetOpened) {
            return undefined;
        }
        return () => optionsRef.current.onClose?.();
    }, [widgetOpened]);

    useEffect(() => closeWidget, [closeWidget]);

    return {
        closeWidget,
        openWidget,
        widgetOpened,
        widgetContent: (
            <>
                {widgetOpened && (
                    <SidePanelPortal>
                        {options.renderContent({
                            onClose: closeWidget,
                            visible: true,
                        })}
                    </SidePanelPortal>
                )}
                {confirmationDialog}
            </>
        ),
    };
}

function SideContent({children}: {children: React.ReactNode}) {
    return children;
}
