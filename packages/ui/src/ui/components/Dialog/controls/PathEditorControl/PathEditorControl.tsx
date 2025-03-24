import React from 'react';
import cn from 'bem-cn-lite';
import PathEditor from '../../../../containers/PathEditor/PathEditor';

const block = cn('path-editor-control');

interface Props {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    autoFocus?: boolean;
}

export function PathEditorControl(props: Props) {
    const {value, placeholder, onChange, ...rest} = props;

    const handleApply = React.useCallback(
        (value: Props['value']) => {
            onChange(value);
        },
        [onChange],
    );

    return (
        <PathEditor
            className={block()}
            defaultPath={value}
            placeholder={placeholder}
            onApply={handleApply}
            onChange={handleApply}
            {...rest}
        />
    );
}

PathEditorControl.getDefaultValue = () => {
    return '';
};

PathEditorControl.isEmpty = (value: Props['value']) => {
    return !value;
};
