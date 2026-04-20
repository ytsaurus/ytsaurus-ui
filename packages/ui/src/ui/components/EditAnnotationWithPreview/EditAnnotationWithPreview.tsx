import React from 'react';

import {type DialogControlProps} from '../Dialog/Dialog.types';
import {EditTextWithPreview, type EditTextWithPreviewProps} from '../EditTextWithPreview';
import {Markdown} from '../Markdown/Markdown';

import i18n from './i18n';

export type EditAnnotationProps = DialogControlProps<
    EditTextWithPreviewProps['value'],
    {
        initialValue: EditAnnotationProps['value'];
        valuePath?: string;
        hideReset?: boolean;
        className: string;
    }
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
        hideReset,
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

    let editorSubTitle = value === undefined ? i18n('context_reset-to-inheritance') : '';
    if (valuePath) editorSubTitle = i18n('context_from-path', {valuePath});

    /**
     * value === undefined means it is already inherited or user already pressed 'Reset to inheritance' button
     */
    const resetActions: EditTextWithPreviewProps['editorActions'] = [];
    if (value === undefined || value === null) {
        if (changed) {
            resetActions.push({
                text: i18n('action_restore'),
                action: () => onChangeProp(initialValueProp),
            });
        }
    } else if (!valuePath || changed) {
        resetActions.push({
            text: i18n('action_reset-to-inheritance'),
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
            editorTitle={i18n('title_description')}
            editorSubTitle={editorSubTitle}
            editorActions={hideReset ? undefined : resetActions}
            editorLang={'markdown'}
            renderPreview={renderPreview}
            initialSplitSize="50%"
        />
    );
}

function renderPreview(value?: string) {
    return <Markdown text={value || ''} />;
}
