import React from 'react';

import {DialogControlProps} from '../../components/Dialog/Dialog.types';
import {
    EditTextWithPreview,
    EditTextWithPreviewProps,
} from '../../components/EditTextWithPreview/EditTextWithPreview';

export type EditAnnotationProps = DialogControlProps<
    EditTextWithPreviewProps['value'],
    {initialValue: EditAnnotationProps['value']; valuePath: string; className: string}
>;

EditAnnotationWithPreview.isEmpty = (value: EditTextWithPreviewProps['value']) => {
    return !value;
};

EditAnnotationWithPreview.getDefaultValue = () => {
    return {value: undefined};
};

export function EditAnnotationWithPreview(props: EditAnnotationProps) {
    const {
        value: valueProp,
        onChange: onChangeProp,
        initialValue: initialValueProp,
        valuePath: valuePathProp,
        className,
    } = props;

    const {value: initialValue} = initialValueProp;
    const {value} = valueProp;
    const onChange = React.useCallback(
        ({value: newValue}: {value?: string} = {}) => {
            if (value !== newValue) {
                const prevIsUndefined = value === undefined;
                if (prevIsUndefined && newValue === '') {
                    // nothing to do
                } else {
                    onChangeProp({value: newValue});
                }
            }
        },
        [onChangeProp, value],
    );

    const valuePath = value === undefined ? undefined : valuePathProp;
    const changed = initialValue !== value;

    /**
     * value === undefined means it is already inherited or user already pressed 'Reset to inheritance' button
     */
    const resetActions: EditTextWithPreviewProps['editorActions'] = [];
    if (value === undefined || value === null) {
        if (changed) {
            resetActions.push({
                text: 'Restore',
                action: () => onChangeProp(initialValueProp),
            });
        }
    } else if (!valuePath || changed) {
        resetActions.push({
            text: 'Reset to inheritance',
            action: () => {
                if (valuePath) {
                    onChangeProp(initialValueProp);
                } else {
                    onChange(undefined);
                }
            },
        });
    }

    return (
        <EditTextWithPreview
            className={className}
            value={valueProp}
            onChange={onChange}
            editorTitle={'Description'}
            editorSubTitle={
                !valuePath
                    ? value === undefined
                        ? '(reset to inheritance)'
                        : ''
                    : `(from ${valuePath})`
            }
            editorActions={resetActions}
            editorLang={'markdown'}
        />
    );
}
