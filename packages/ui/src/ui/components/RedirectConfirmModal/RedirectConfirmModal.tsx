import {useHistory} from 'react-router-dom';
import React, {FC, useCallback, useEffect, useRef, useState} from 'react';
import {Location, TransitionPromptHook} from 'history';
import {YTDFDialog} from '../Dialog';

type Props = {
    title: string;
    message: string;
    ignoreSamePath?: boolean;
};

export const RedirectConfirmModal: FC<Props> = ({title, message, ignoreSamePath = true}) => {
    const [showModal, setShowModal] = useState(false);
    const history = useHistory();
    const skipRef = useRef(false);
    const locationRef = useRef<Location>();

    const handleNavigation = useCallback<TransitionPromptHook<unknown>>(
        (location) => {
            const samePath = window.location.pathname === location.pathname && ignoreSamePath;
            if (skipRef.current || samePath) return;

            locationRef.current = location;
            setShowModal(true);
            return false;
        },
        [ignoreSamePath],
    );

    const handleConfirm = async () => {
        setShowModal(false);
        if (locationRef.current) {
            skipRef.current = true;
            history.push(locationRef.current.pathname);
        }
    };

    const handleCancel = () => {
        setShowModal(false);
    };

    useEffect(() => {
        const unblock = history.block(handleNavigation);
        return () => unblock();
    }, [history, handleNavigation]);

    return (
        <YTDFDialog
            visible={showModal}
            pristineSubmittable
            headerProps={{title}}
            fields={[
                {
                    type: 'block',
                    name: 'message',
                    extras: {
                        children: message,
                    },
                },
            ]}
            onAdd={handleConfirm}
            onClose={handleCancel}
        />
    );
};
