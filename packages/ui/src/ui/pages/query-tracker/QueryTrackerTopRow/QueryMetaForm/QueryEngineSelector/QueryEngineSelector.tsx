import React, {useCallback, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {ModalWithoutHandledScrollBar as Modal} from '../../../../../components/Modal/Modal';
import {QueryEnginesNames} from '../../../utils/query';
import {Engines, QueryEngine} from '../../../module/api';
import {SET_QUERY_PATCH, createQueryFromTablePath} from '../../../module/query/actions';
import {
    getQueryDraft,
    hasLoadedQueryItem,
    isQueryDraftEditted,
} from '../../../module/query/selectors';
import RadioButton from '../../../../../components/RadioButton/RadioButton';

const EngineOptions = Engines.map((key) => ({
    value: key,
    text: QueryEnginesNames[key],
}));

interface Props {
    className?: string;
    cluster?: string;
    path?: string;
}

export function QueryEngineSelector({className, cluster, path}: Props) {
    const dispatch = useDispatch();
    const draft = useSelector(getQueryDraft);
    const isEdited = useSelector(isQueryDraftEditted);
    const hasLoadedQuery = useSelector(hasLoadedQueryItem);
    const [modalVisibility, setModalVisibility] = useState<boolean>(false);
    const [selectedEngine, setSelectedEngine] = useState<QueryEngine | undefined>(undefined);
    const showPrompt = (isEdited || hasLoadedQuery) && cluster && path;

    const updateEngine = useCallback(
        (engine: QueryEngine) => {
            dispatch({
                type: SET_QUERY_PATCH,
                data: {
                    engine: engine,
                },
            });
            if (cluster && path) {
                dispatch(createQueryFromTablePath(engine, cluster, path));
            }
        },
        [cluster, dispatch, path],
    );

    const onEngineSelected = useCallback(
        (engine: string) => {
            const newEngine = engine as QueryEngine;
            setSelectedEngine(newEngine);
            if (showPrompt) {
                setModalVisibility(true);
            } else {
                updateEngine(newEngine);
            }
        },
        [showPrompt, updateEngine],
    );

    const handleClose = useCallback(() => {
        setSelectedEngine(undefined);
        setModalVisibility(false);
    }, []);

    const handleConfirm = useCallback(() => {
        setSelectedEngine(undefined);
        if (selectedEngine) updateEngine(selectedEngine);
        setModalVisibility(false);
    }, [selectedEngine, updateEngine]);

    return (
        <>
            <RadioButton
                className={className}
                size="l"
                value={draft.engine}
                onUpdate={onEngineSelected}
                name="query-tracker-engine-selector"
                items={EngineOptions}
            />
            <Modal
                title="Switching engine"
                content="All the changes will be lost. Are you sure you want to switch the engine?"
                visible={modalVisibility}
                onCancel={handleClose}
                onConfirm={handleConfirm}
                onOutsideClick={handleClose}
            />
        </>
    );
}
