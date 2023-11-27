import React from 'react';

import {Text} from '@gravity-ui/uikit';

import {
    EditTextWithPreview,
    EditTextWithPreviewProps,
} from '../../components/EditTextWithPreview/EditTextWithPreview';
import Yson, {YsonProps} from '../../components/Yson/Yson';
import ErrorBoundary from '../../components/ErrorBoundary/ErrorBoundary';
import {DialogControlProps} from '../../components/Dialog/Dialog.types';

export type EditJsonProps = DialogControlProps<
    {value: string | undefined; error?: string},
    {
        unipikaSettings?: YsonProps['settings'];
    }
> &
    Omit<
        EditTextWithPreviewProps,
        keyof DialogControlProps<unknown> | 'renderPreview' | 'editorLang'
    >;

const YsonPreviewMemo = React.memo(YsonPreview);

EditJsonWithPreview.isEmpty = (value: EditTextWithPreviewProps['value']) => {
    return !value;
};

EditJsonWithPreview.getDefaultValue = () => {
    return {value: undefined};
};

export function EditJsonWithPreview({
    value: valueProp,
    onChange,
    unipikaSettings,
    ...rest
}: EditJsonProps) {
    const {value} = valueProp;
    const onTextChange = React.useCallback(
        ({value: newValue}: {value?: string} = {}) => {
            if (value !== newValue) {
                const prevIsUndefined = value === undefined;
                if (prevIsUndefined && newValue === '') {
                    // nothing to do
                } else {
                    onChange({value: newValue});
                }
            }
        },
        [onChange, value],
    );

    const onError = React.useCallback(
        (e: any) => {
            onChange({value, error: `${e}`});
        },
        [value, onChange],
    );

    return (
        <EditTextWithPreview
            initialShowPreview
            {...rest}
            value={valueProp}
            onChange={onTextChange}
            editorTitle={'Use JSON syntax'}
            editorLang={'json'}
            renderPreview={() => (
                // This ErrorBoundary catches some unipika errors
                <ErrorBoundary
                    key={value}
                    maxCompactMessageLength={200}
                    onError={onError}
                    disableRum
                >
                    <YsonPreviewMemo
                        value={valueProp}
                        settings={unipikaSettings}
                        onError={onError}
                    />
                </ErrorBoundary>
            )}
        />
    );
}

function YsonPreview({
    value: {value, error},
    settings,
    onError,
}: {
    value: EditJsonProps['value'];
    settings: YsonProps['settings'];
    onError: (e: any) => void;
}) {
    const obj = React.useMemo(() => {
        try {
            return JSON.parse(value || 'null');
        } catch (e) {
            onError(e);
            return undefined;
        }
    }, [value, onError]);

    if (error) {
        return <Text color="danger">{error}</Text>;
    }

    return <Yson value={obj} settings={settings} />;
}
