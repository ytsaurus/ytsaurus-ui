import React, {type FC, useCallback, useState} from 'react';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {
    selectClusterLoading,
    selectHasLoadedQueryItem,
    selectIsQueryDraftEditted,
    selectQueryEngine,
    selectQueryGetParams,
    selectSupportedEnginesOptions,
} from '../../../../store/selectors/query-tracker/query';
import {
    createQueryFromTablePath,
    updateQueryDraft,
} from '../../../../store/actions/query-tracker/query';
import {type QueryEngine} from '../../../../../shared/constants/engines';
import {ModalWithoutHandledScrollBar as Modal} from '../../../../components/Modal/Modal';
import RadioButton from '../../../../components/RadioButton/RadioButton';
import {Select} from '@gravity-ui/uikit';
import './QueryEngineSelector.scss';
import cn from 'bem-cn-lite';
import i18n from './i18n';

const block = cn('yt-query-engine-selector');

type Props = {
    isDesktop?: boolean;
    className?: string;
    onChange?: (newEngine: QueryEngine) => void;
};

export const QueryEngineSelector: FC<Props> = ({isDesktop, className, onChange}) => {
    const dispatch = useDispatch();
    const engine = useSelector(selectQueryEngine);
    const options = useSelector(selectSupportedEnginesOptions);
    const isEdited = useSelector(selectIsQueryDraftEditted);
    const hasLoadedQuery = useSelector(selectHasLoadedQueryItem);
    const loading = useSelector(selectClusterLoading);
    const {cluster, path} = useSelector(selectQueryGetParams);

    const showPrompt = Boolean((isEdited || hasLoadedQuery) && cluster && path);

    const [modalVisibility, setModalVisibility] = useState<boolean>(false);
    const [selectedEngine, setSelectedEngine] = useState<QueryEngine | undefined>(undefined);

    const handleChangeEngine = useCallback(
        (newEngine: QueryEngine) => {
            if (cluster && path) {
                dispatch(createQueryFromTablePath(newEngine, cluster, path));
            } else {
                dispatch(updateQueryDraft({engine: newEngine}));
            }
            onChange?.(newEngine);
        },
        [cluster, dispatch, onChange, path],
    );

    const handleOnChange = useCallback(
        (value: string | string[]) => {
            const newEngine = (Array.isArray(value) ? value[0] : value) as QueryEngine;
            setSelectedEngine(newEngine);
            if (showPrompt) {
                setModalVisibility(true);
            } else {
                handleChangeEngine(newEngine);
            }
        },
        [handleChangeEngine, showPrompt],
    );

    const handleClose = useCallback(() => {
        setSelectedEngine(undefined);
        setModalVisibility(false);
    }, []);

    const handleConfirm = useCallback(() => {
        setSelectedEngine(undefined);
        if (selectedEngine) handleChangeEngine(selectedEngine);
        setModalVisibility(false);
    }, [selectedEngine, handleChangeEngine]);

    return (
        <>
            <div className={block()}>
                {isDesktop ? (
                    <RadioButton
                        className={className}
                        value={engine}
                        size="l"
                        items={options}
                        disabled={loading}
                        onUpdate={handleOnChange}
                    />
                ) : (
                    <Select
                        className={block('select', className)}
                        value={[engine]}
                        size="l"
                        options={options}
                        disabled={loading}
                        onUpdate={handleOnChange}
                    />
                )}
            </div>
            <Modal
                title={i18n('title_switching-engine')}
                content={i18n('confirm_switching-engine')}
                visible={modalVisibility}
                onCancel={handleClose}
                onConfirm={handleConfirm}
                onOutsideClick={handleClose}
            />
        </>
    );
};
