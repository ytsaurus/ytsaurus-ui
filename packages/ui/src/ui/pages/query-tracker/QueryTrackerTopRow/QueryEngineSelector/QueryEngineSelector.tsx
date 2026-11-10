import {useQueryEngineChange} from '../../hooks/useQueryEngineChange';
import React, {type FC, useCallback, useState} from 'react';
import {useSelector} from '../../../../store/redux-hooks';
import {
    selectClusterLoading,
    selectQueryEngine,
    selectSupportedEnginesOptions,
} from '../../../../store/selectors/query-tracker/query';
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
    onChange?: (newEngine: QueryEngine) => void | Promise<void>;
    tableCluster?: string;
    tablePath?: string;
};

export const QueryEngineSelector: FC<Props> = ({
    isDesktop,
    className,
    onChange,
    tableCluster,
    tablePath,
}) => {
    const engine = useSelector(selectQueryEngine);
    const options = useSelector(selectSupportedEnginesOptions);
    const loading = useSelector(selectClusterLoading);
    const {showPrompt, applyEngine: handleChangeEngine} = useQueryEngineChange({
        tableCluster,
        tablePath,
        onChange,
    });

    const [modalVisibility, setModalVisibility] = useState<boolean>(false);
    const [selectedEngine, setSelectedEngine] = useState<QueryEngine | undefined>(undefined);

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
        const engineToApply = selectedEngine;
        setSelectedEngine(undefined);
        setModalVisibility(false);

        if (engineToApply) {
            handleChangeEngine(engineToApply);
        }
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
            />
        </>
    );
};
