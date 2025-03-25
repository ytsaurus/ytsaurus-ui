import {useHistory} from 'react-router-dom';
import React, {FC, useCallback, useEffect, useRef, useState} from 'react';
import Modal from '../Modal/Modal';
import {Location, TransitionPromptHook} from 'history';

type Props = {
    when: boolean;
    title: string;
    message: string;
    ignoreSamePath?: boolean;
};

export const RedirectConfirmModal: FC<Props> = ({when, title, message, ignoreSamePath = true}) => {
    const [showModal, setShowModal] = useState(false);
    const history = useHistory();
    const skipRef = useRef(false);
    const locationRef = useRef<Location>();

    const handleNavigation = useCallback<TransitionPromptHook<unknown>>(
        (location) => {
            const samePath = window.location.pathname === location.pathname && ignoreSamePath;
            if (!when || skipRef.current || samePath) return;

            locationRef.current = location;
            setShowModal(true);
            return false;
        },
        [ignoreSamePath, when],
    );

    const handleConfirm = () => {
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
        if (!when) {
            setShowModal(false);
        }
        skipRef.current = false;
    }, [when]);

    useEffect(() => {
        if (!when) return;

        const unblock = history.block(handleNavigation);
        return () => unblock();
    }, [when, history, handleNavigation]);

    return (
        <Modal
            title={title}
            content={message}
            onCancel={handleCancel}
            onConfirm={handleConfirm}
            onOutsideClick={handleCancel}
            visible={showModal}
        />
    );
};
