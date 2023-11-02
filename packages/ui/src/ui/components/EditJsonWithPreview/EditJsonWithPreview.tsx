import React from 'react';

import {Text} from '@gravity-ui/uikit';

import {
    EditTextWithPreview,
    EditTextWithPreviewProps,
} from '../../components/EditTextWithPreview/EditTextWithPreview';
import Yson from '../../components/Yson/Yson';

export type EditJsonProps = EditTextWithPreviewProps & {initialValue?: EditJsonProps['value']};

EditJsonWithPreview.isEmpty = (value: EditTextWithPreviewProps['value']) => {
    return !value;
};

EditJsonWithPreview.getDefaultValue = () => {
    return {value: undefined};
};

export function EditJsonWithPreview({
    value: valueProp,
    onChange: onChangeProp,
    initialValue: initialValueProp,
    ...rest
}: EditJsonProps) {
    const {value: initialValue} = initialValueProp ?? {};
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

    const changed = initialValue !== value;

    const resetActions: EditTextWithPreviewProps['editorActions'] = [];
    if (changed) {
        resetActions.push({
            text: 'Restore',
            action: () => onChangeProp(initialValueProp ?? {value: undefined}),
        });
    }

    return (
        <EditTextWithPreview
            initialShowPreview
            {...rest}
            value={valueProp}
            onChange={onChange}
            editorTitle={'Use JSON syntax'}
            editorActions={resetActions}
            editorLang={'json'}
            renderPreview={renderYsonPreview}
        />
    );
}

function renderYsonPreview(value?: string) {
    return <YsonPreview value={value} />;
}

function YsonPreview({value}: {value?: string}) {
    const obj = React.useMemo(() => {
        try {
            return {value: JSON.parse(value || 'null')};
        } catch (e) {
            return {error: e as Error};
        }
    }, [value]);
    if (obj.error) {
        return <Text color="danger">{obj.error?.message}</Text>;
    }

    return <Yson value={obj.value} />;
}
