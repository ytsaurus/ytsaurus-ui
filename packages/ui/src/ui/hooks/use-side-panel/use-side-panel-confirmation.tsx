import React, {useCallback, useRef} from 'react';
import {useDispatch, useSelector} from '../../store/redux-hooks';
import {
    finishSidePanelConfirmation,
    requestSidePanelConfirmation,
} from '../../store/actions/global';
import {SidePanelReplacementConfirmationDialog} from './SidePanelReplacementConfirmationDialog/SidePanelReplacementConfirmationDialog';

type Props = {
    ownerId: string;
    type: string;
};

export function useSidePanelConfirmation({ownerId, type}: Props) {
    const dispatch = useDispatch();
    const replacement = useSelector((state) => state.global.sidePanelReplacement);
    const pendingAction = useRef<() => void>();

    const requestConfirmation = useCallback(
        (action: () => void) => {
            if (dispatch(requestSidePanelConfirmation(ownerId, type))) {
                pendingAction.current = action;
                return;
            }
            pendingAction.current = undefined;
            action();
        },
        [dispatch, ownerId, type],
    );

    const cancelReplacement = () => {
        if (replacement && dispatch(finishSidePanelConfirmation(replacement))) {
            pendingAction.current = undefined;
        }
    };

    const confirmReplacement = () => {
        const action = pendingAction.current;
        if (action && replacement && dispatch(finishSidePanelConfirmation(replacement))) {
            pendingAction.current = undefined;
            action();
        }
    };

    return {
        requestConfirmation,
        confirmationDialog: replacement?.ownerId === ownerId && (
            <SidePanelReplacementConfirmationDialog
                onConfirm={confirmReplacement}
                onClose={cancelReplacement}
            />
        ),
    };
}
