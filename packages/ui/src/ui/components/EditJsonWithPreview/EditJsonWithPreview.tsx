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
    nullPreview,
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
    nullPreview,
}: {
    value: EditJsonProps['value'];
    settings: YsonProps['settings'];
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
                <Yson value={nullPreview ?? null} settings={settings} />
            </React.Fragment>
        );
    }

    return <Yson value={obj} settings={settings} />;
}
