import React from 'react';
import cn from 'bem-cn-lite';
import SplitPane from 'react-split-pane';

import {DialogControlProps} from '../../components/Dialog/Dialog.types';
import MonacoEditor from '../../components/MonacoEditor';
import Icon from '../../components/Icon/Icon';

import TabbedContent from './TabbedContent';

import './EditTextWithPreview.scss';
import {DropdownMenuItem} from '@gravity-ui/uikit';

const block = cn('edit-text-with-preview');

export type EditTextWithPreviewProps = DialogControlProps<
    {value: string | undefined},
    {
        className?: string;
        editorActions?: Array<DropdownMenuItem>;
        editorTitle?: string;
        editorSubTitle?: string;
        disabled?: boolean;

        editorLang: 'markdown' | 'json';
        renderPreview: (value?: string) => React.ReactElement;

        minHeight?: number;

        initialShowPreview?: boolean;
    }
>;

EditTextWithPreview.isEmpty = (value: EditTextWithPreviewProps['value']) => {
    return !value;
};

EditTextWithPreview.getDefaultValue = () => {
    return {value: undefined};
};

export function EditTextWithPreview({
    value: valueProp,
    onChange: onChangeProp,
    editorLang,
    editorActions,
    className,
    editorTitle = 'Text',
    editorSubTitle,
    renderPreview,
    minHeight,
    initialShowPreview,
    disabled,
}: EditTextWithPreviewProps) {
    const {value} = valueProp;

    const [showPreview, setShowPreview] = React.useState(initialShowPreview);
    const togglePreview = React.useCallback(() => {
        setShowPreview(!showPreview);
    }, [setShowPreview, showPreview]);

    const showHideAction = {
        text: !showPreview ? 'Show preview' : 'Hide',
        icon: <Icon awesome={!showPreview ? 'eye' : 'eye-slash'} />,
        action: togglePreview,
    };

    const actions = showPreview ? editorActions : [...(editorActions ?? []), showHideAction];

    const onChange = React.useCallback(
        (value: string) => {
            onChangeProp({value});
        },
        [onChangeProp],
    );

    const left = (
        <TabbedContent
            key="editor"
            className={block('panel', {growable: !showPreview})}
            contentClassName={block('left')}
            name={editorTitle}
            subTitle={editorSubTitle}
            actions={actions}
            actionAsDropdown={showPreview}
        >
            <MonacoEditor
                value={value || ''}
                language={editorLang}
                className={block('monaco')}
                onChange={onChange}
                readOnly={disabled}
            />
        </TabbedContent>
    );

    const sizeRef = React.useRef<number>(350);

    const style = React.useMemo(() => {
        return minHeight ? {minHeight} : undefined;
    }, [minHeight]);

    const divProps = {className: block(null, className), style: style};

    if (!showPreview) {
        return <div {...divProps}>{left}</div>;
    }

    return (
        <div {...divProps}>
            <SplitPane
                allowResize={true}
                minSize={160}
                maxSize={-160}
                defaultSize={sizeRef.current}
                onDragFinished={(size) => {
                    sizeRef.current = size;
                }}
                {...{
                    children: [
                        left,
                        !showPreview ? null : (
                            <TabbedContent
                                key="preview"
                                className={block('panel')}
                                contentClassName={block('markdown')}
                                name={'Preview'}
                                actions={[showHideAction]}
                            >
                                {renderPreview ? renderPreview(value) : value}
                            </TabbedContent>
                        ),
                    ],
                }}
            />
        </div>
    );
}
