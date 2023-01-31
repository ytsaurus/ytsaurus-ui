import React from 'react';
import cn from 'bem-cn-lite';

import {DialogControlProps} from '../../../components/Dialog/Dialog.types';
import MonacoEditor from '../../../components/MonacoEditor/MonacoEditor';
import {Markdown} from '../../../components/Markdown/Markdown';
import TabbedContent from './TabbedContent';
import SplitPane from 'react-split-pane';
import Icon from '../../../components/Icon/Icon';

import './AnnotationEditor.scss';

const block = cn('annotation-editor');

type Props = DialogControlProps<
    {value: string | undefined},
    {initialValue: Props['value']; valuePath: string; className: string}
>;

export default function AnnotationEditor(props: Props) {
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
        (newValue?: string) => {
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

    const [showPreview, setShowPreview] = React.useState(false);
    const togglePreview = React.useCallback(() => {
        setShowPreview(!showPreview);
    }, [setShowPreview, showPreview]);

    const showHideAction = {
        text: !showPreview ? 'Show preview' : 'Hide',
        icon: <Icon awesome={!showPreview ? 'eye' : 'eye-slash'} />,
        action: togglePreview,
    };

    /**
     * value === undefined means it is already inherited or user already pressed 'Reset to inheritance' button
     */
    const resetActions = [];
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

    const editorActions = showPreview ? resetActions : [...resetActions, showHideAction];

    const left = (
        <TabbedContent
            key="editor"
            className={block('panel', {growable: !showPreview})}
            contentClassName={block('left')}
            name={'Description'}
            subTitle={
                !valuePath
                    ? value === undefined
                        ? '(reset to inheritance)'
                        : ''
                    : `(from ${valuePath})`
            }
            actions={editorActions}
            actionAsDropdown={showPreview}
        >
            <MonacoEditor
                value={value || ''}
                language={'markdown'}
                className={block('monaco')}
                onChange={onChange}
            />
        </TabbedContent>
    );

    const sizeRef = React.useRef<number>(350);

    if (!showPreview) {
        return <div className={block(null, className)}>{left}</div>;
    }

    return (
        <div className={block(null, className)}>
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
                                <Markdown text={value || ''} />
                            </TabbedContent>
                        ),
                    ],
                }}
            />
        </div>
    );
}

AnnotationEditor.isEmpty = (value: Props['value']) => {
    return !value;
};

AnnotationEditor.getDefaultValue = () => {
    return {value: undefined};
};
