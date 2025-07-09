import React from 'react';
import debounce_ from 'lodash/debounce';

import {TextInput, TextInputProps} from '@gravity-ui/uikit';

export interface TextInputWithDebounceProps extends TextInputProps {
    debounce?: number;
    onBlur?: (e: React.FocusEvent) => void;
    onEnterKeyDown?: (e: React.KeyboardEvent) => void;
}

function TextInputWithDebounce(props: TextInputWithDebounceProps) {
    const {
        debounce = 400,
        onUpdate = () => {},
        onBlur,
        value,
        onEnterKeyDown,
        onKeyDown,
        ...rest
    } = props;

    const [input, setInput] = React.useState<string | undefined>();

    const handleChangeExt = React.useMemo(() => {
        return debounce_(onUpdate as any, debounce);
    }, [debounce, onUpdate]);

    const handleChange = React.useCallback(
        (text: string) => {
            setInput(text);
            handleChangeExt(text);
        },
        [handleChangeExt, setInput],
    );

    const handleKeyDown = React.useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (onKeyDown) {
                onKeyDown(e);
            }
            if (e.key === 'Enter' && onEnterKeyDown) {
                onEnterKeyDown(e);
            }
        },
        [onEnterKeyDown, onKeyDown],
    );

    const handleBlur = React.useCallback(
        (e: React.FocusEvent<HTMLInputElement>) => {
            setInput(undefined);

            if (onBlur) {
                onBlur(e);
            }
        },
        [setInput, onBlur],
    );

    React.useEffect(() => {
        return () => {
            handleChangeExt.cancel();
        };
    }, [handleChangeExt]);

    return (
        <TextInput
            onUpdate={handleChange}
            {...rest}
            value={input === undefined ? value : input}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
        />
    );
}

export default React.memo(TextInputWithDebounce);
