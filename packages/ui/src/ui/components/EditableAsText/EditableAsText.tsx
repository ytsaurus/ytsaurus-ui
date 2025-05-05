import React, {useCallback, useEffect} from 'react';
import cn from 'bem-cn-lite';

import {TextInput} from '@gravity-ui/uikit';
import Icon from '../Icon/Icon';

import './EditableAsText.scss';
import Button, {ButtonProps} from '../Button/Button';
const block = cn('editable-as-text');

interface Props {
    className?: string;
    editorClassName?: string;

    text?: string;
    children: React.ReactNode;
    onChange: (v?: string) => void;
    disableEdit?: boolean;
    withControls?: boolean;
    cancelOnClose?: boolean;
    openOnClick?: boolean;
    size?: 's' | 'm' | 'l' | 'xl';
    saveButtonView?: ButtonProps['view'];
    cancelButtonView?: ButtonProps['view'];

    renderEditor?: (props: {
        value?: string;
        onBlur: () => void;
        onChange: (value?: string) => void;
        className?: string;
        onApply: (value?: string) => void;
    }) => React.ReactNode;
    onModeChange?: (isEdit: boolean) => void;
}

export function EditableAsText(props: Props) {
    const {
        children,
        onChange,
        text,
        className,
        withControls,
        size,
        disableEdit,
        cancelOnClose,
        openOnClick,
        renderEditor,
        onModeChange,
        saveButtonView = 'normal',
        cancelButtonView = 'normal',
    } = props;
    const [editMode, setEditMode] = React.useState(false);
    const [input, setInput] = React.useState(text || '');

    useEffect(() => {
        setInput(text || '');
    }, [text]);

    const handleChangeMode = useCallback(
        (isEdit: boolean) => {
            if (onModeChange) onModeChange(isEdit);
            setEditMode(isEdit);
        },
        [onModeChange],
    );

    const closeEditMode = React.useCallback(() => {
        handleChangeMode(false);
        if (cancelOnClose) setInput(text || '');
    }, [cancelOnClose, handleChangeMode, text]);

    const startTextEdit = useCallback(() => {
        handleChangeMode(true);
    }, [handleChangeMode]);

    const handleWrapClick = () => {
        if (!editMode && openOnClick) {
            startTextEdit();
        }
    };

    const handleChange = React.useCallback((val?: string) => setInput(val ?? ''), [setInput]);

    const applyValue = useCallback(() => {
        handleChangeMode(false);
        onChange(input);
    }, [onChange, handleChangeMode, input]);

    const closeAndResetValue = useCallback(() => {
        handleChangeMode(false);
        setInput(text || '');
    }, [handleChangeMode, text]);

    const onApply = useCallback(
        (value?: string) => {
            handleChangeMode(false);
            onChange(value);
        },
        [handleChangeMode, onChange],
    );

    const handleKeyDown = React.useCallback(
        (evt: React.KeyboardEvent<HTMLElement>) => {
            if (evt.key === 'Enter') {
                applyValue();
            }
            if (evt.key === 'Escape') {
                closeAndResetValue();
            }
        },
        [applyValue, closeAndResetValue],
    );

    const controlSize = size ? size : 'm';

    return (
        <div
            className={block(null, [className || '', editMode ? 'edit' : ''])}
            onClick={handleWrapClick}
        >
            {editMode ? (
                <>
                    {renderEditor ? (
                        renderEditor({
                            value: input,
                            onChange: handleChange,
                            className: block('control'),
                            onBlur: closeEditMode,
                            onApply,
                        })
                    ) : (
                        <TextInput
                            className={block('control')}
                            autoFocus
                            size={controlSize}
                            value={input}
                            onUpdate={handleChange}
                            onKeyDown={handleKeyDown}
                            onBlur={closeEditMode}
                        />
                    )}
                    {withControls && (
                        <>
                            <Button
                                className={block('control')}
                                view={saveButtonView}
                                extraProps={{onMouseDown: applyValue}}
                                size={controlSize}
                            >
                                <Icon awesome={'check'} size={controlSize} />
                            </Button>
                            <Button
                                className={block('control')}
                                view={cancelButtonView}
                                extraProps={{onMouseDown: closeAndResetValue}}
                                size={controlSize}
                            >
                                <Icon awesome={'times'} size={controlSize} />
                            </Button>
                        </>
                    )}
                </>
            ) : (
                <React.Fragment>
                    {children}
                    {!disableEdit && (
                        <Button
                            className={block('control', {type: 'edit'})}
                            view="outlined"
                            onClick={startTextEdit}
                            size={controlSize}
                        >
                            <Icon awesome={'pencil'} size={controlSize} />
                        </Button>
                    )}
                </React.Fragment>
            )}
        </div>
    );
}

export function EditButton({
    onClick,
    size = 'm',
}: {
    onClick: () => void;
    size?: ButtonProps['size'];
}) {
    return (
        <Button
            className={block('edit-btn')}
            onClick={onClick}
            size={size}
            qa="qa:navigation:edit-path"
        >
            <Icon awesome={'pencil'} />
        </Button>
    );
}
