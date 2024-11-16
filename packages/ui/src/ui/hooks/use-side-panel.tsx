import React from 'react';
import {useDispatch} from 'react-redux';

import withSplit from '../hocs/withSplit';
import {mergeScreen, splitScreen} from '../store/actions/global';

type SidePanelContentProps = {
    onClose: () => void;
    renderContent(props: {visible: boolean; onClose: () => void}): React.ReactNode;
};

export const SidePanelPortal = withSplit(SideContent);

export function useSidePanel(
    name: string,
    {renderContent}: Pick<SidePanelContentProps, 'renderContent'>,
) {
    const [widgetOpened, setWidgetOpened] = React.useState(false);
    const dispatch = useDispatch();

    const openWidget = React.useCallback(() => {
        dispatch(splitScreen(name));
        setWidgetOpened(true);
    }, [setWidgetOpened, dispatch]);

    const onClose = React.useCallback(() => {
        setWidgetOpened(false);
        dispatch(mergeScreen());
    }, [setWidgetOpened, dispatch]);

    return {
        closeWidget: onClose,
        openWidget,
        widgetOpened,
        widgetContent: widgetOpened ? (
            <SidePanelPortal>{renderContent({onClose, visible: widgetOpened})}</SidePanelPortal>
        ) : null,
    };
}

function SideContent({children}: {children: React.ReactNode}) {
    return children;
}
