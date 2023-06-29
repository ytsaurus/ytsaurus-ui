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
    size?: 's' | 'm' | 'l' | 'xl';
}

export function EditableAsText(props: Props) {
    const {children, onChange, text, className, withControls, size} = props;
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

    const controlSize = size ? size : 'm';

    return (
        <div className={block(null, className)}>
            {editMode ? (
                <>
                    <TextInput
                        className={block('control')}
                        autoFocus
                        size={controlSize}
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
                                size={controlSize}
                            >
                                <Icon awesome={'check'} size={controlSize} />
                            </Button>
                            <Button
                                className={block('control')}
                                view="normal"
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
                    <Button
                        className={block('control', {type: 'edit'})}
                        view="outlined"
                        onClick={startTextEdit}
                        size={controlSize}
                    >
                        <Icon awesome={'pencil'} size={controlSize} />
                    </Button>
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
