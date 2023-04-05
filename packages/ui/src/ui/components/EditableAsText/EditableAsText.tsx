import React, {useCallback} from 'react';
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
    onChange: (v: string) => void;
    withControls?: boolean;
}

export function EditableAsText(props: Props) {
    const {children, onChange, text, className, withControls} = props;
    const [editMode, setEditMode] = React.useState(false);
    const [input, setInput] = React.useState(text || '');

    const closeEditMode = React.useCallback(() => {
        setEditMode(false);
    }, []);

    const startTextEdit = useCallback(() => {
        setEditMode(true);
    }, [setEditMode]);

    const handleChange = React.useCallback((val: string) => setInput(val), [setInput]);

    const applyValue = useCallback(() => {
        setEditMode(false);
        onChange(input);
    }, [onChange, setEditMode, input]);

    const closeAndResetValue = useCallback(() => {
        setEditMode(false);
        setInput(text || '');
    }, [setInput, setEditMode, text]);

    const handleKeyDown = React.useCallback(
        (evt: React.KeyboardEvent<HTMLInputElement>) => {
            if (evt.key === 'Enter') {
                applyValue();
            }
            if (evt.key === 'Escape') {
                closeAndResetValue();
            }
        },
        [applyValue, closeAndResetValue],
    );

    return (
        <div className={block(null, className)}>
            {editMode ? (
                <>
                    <TextInput
                        className={block('control')}
                        autoFocus
                        size="m"
                        value={input}
                        onUpdate={handleChange}
                        onKeyDown={handleKeyDown}
                        onBlur={closeEditMode}
                    />
                    {withControls && (
                        <>
                            <Button
                                className={block('control')}
                                view="normal"
                                extraProps={{onMouseDown: applyValue}}
                            >
                                <Icon awesome={'check'} />
                            </Button>
                            <Button
                                className={block('control')}
                                view="normal"
                                extraProps={{onMouseDown: closeAndResetValue}}
                            >
                                <Icon awesome={'times'} />
                            </Button>
                        </>
                    )}
                </>
            ) : (
                <React.Fragment>
                    {children}
                    <div className={block('icon')} onClick={startTextEdit}>
                        <Icon awesome={'pencil'} />
                    </div>
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
        <Button className={block('edit-btn')} onClick={onClick} size={size}>
            <Icon awesome={'pencil'} />
        </Button>
    );
}
