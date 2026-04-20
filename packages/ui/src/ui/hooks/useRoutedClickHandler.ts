import {type MouseEvent, type MouseEventHandler, useCallback} from 'react';

const isModifiedEvent = (event: MouseEvent): boolean => {
    return event.metaKey || event.altKey || event.ctrlKey || event.shiftKey;
};

type Params = {
    navigate: () => void;
    onClick: MouseEventHandler | undefined;
};

export const useRoutedClickHandler = ({navigate, onClick}: Params): MouseEventHandler => {
    return useCallback(
        (event) => {
            onClick?.(event);

            if (event.defaultPrevented || isModifiedEvent(event)) {
                return;
            }

            event.preventDefault();
            navigate();
        },
        [navigate, onClick],
    );
};
