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
        nullPreview?: any;
        folding?: boolean;
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

EditJsonWithPreview.validate = (value: EditTextWithPreviewProps['value']) => {
    try {
        if (!value.value) return undefined;
        JSON.parse(value.value);
        return undefined;
    } catch (e) {
        return (e as Error).message;
    }
};

EditJsonWithPreview.getDefaultValue = () => {
    return {value: undefined};
};

export function EditJsonWithPreview({
    value: valueProp,
    onChange,
    unipikaSettings,
    nullPreview,
    folding,
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
                    // validate newValue
                    try {
                        if (newValue) JSON.parse(newValue);
                        onChange({value: newValue});
                    } catch (e) {
                        if (!(e instanceof Error)) return;
                        onChange({value: newValue, error: e.message});
                    }
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
            editorTitle={'Use JSON syntax' + (rest.disabled ? ' (readonly)' : '')}
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
                        nullPreview={nullPreview}
                        settings={unipikaSettings}
                        onError={onError}
                        folding={folding}
                    />
                </ErrorBoundary>
            )}
        />
    );
}

function YsonPreview({
    value: {value, error},
    settings,
    folding,
    onError,
    nullPreview,
}: {
    value: EditJsonProps['value'];
    settings: YsonProps['settings'];
    folding: YsonProps['folding'];
    onError: (e: any) => void;
    nullPreview: any;
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

    if (obj === null || obj === undefined) {
        return (
            <React.Fragment>
                Default value:
                <Yson value={nullPreview ?? null} folding={folding} settings={settings} />
            </React.Fragment>
        );
    }

    return <Yson value={obj} folding={folding} settings={settings} />;
}
