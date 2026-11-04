import React, {type FC, useRef} from 'react';
import {setFileEditor} from '../../../store/reducers/query-tracker/queryFilesFormSlice';
import {selectFileEditorConfig} from '../../../store/selectors/query-tracker/queryFilesForm';
import {changeQueryFile} from '../../../store/actions/query-tracker/queryFilesForm';
import {useDispatch, useSelector} from '../../../store/redux-hooks';
import FileIcon from '@gravity-ui/icons/svgs/file.svg';
import XmarkIcon from '@gravity-ui/icons/svgs/xmark.svg';
import SquareIcon from '@gravity-ui/icons/svgs/square.svg';
import LayoutColumnsIcon from '@gravity-ui/icons/svgs/layout-columns.svg';
import {Button, Icon, Text, useThemeValue} from '@gravity-ui/uikit';
import withLazyLoading from '../../../hocs/withLazyLoading';

import './FileEditor.scss';
import cn from 'bem-cn-lite';
import MonacoEditor, {type MonacoEditorConfig} from '../../../components/MonacoEditor';
import type * as monaco from 'monaco-editor';

const QueriesKitMonacoEditor = withLazyLoading(
    React.lazy(() =>
        import(
            /* webpackChunkName: "queries-kit-file-editor" */ '@gravity-ui/querieskit/components/MonacoEditor'
        ).then(({MonacoEditor: Editor}) => ({default: Editor})),
    ),
);

const block = cn('file-editor');

const MONACO_CONFIG: MonacoEditorConfig = {
    fontSize: 14,
    language: 'plaintext',
    renderWhitespace: 'boundary',
    minimap: {
        enabled: true,
    },
};

type Props = {useQueriesKit?: boolean};

export const FileEditor: FC<Props> = ({useQueriesKit = false}) => {
    const theme = useThemeValue();
    const dispatch = useDispatch();
    const {fileEditor, file} = useSelector(selectFileEditorConfig);
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();

    const handleOnChange = (content: string) => {
        if (!file) return;
        dispatch(changeQueryFile({...file, content}));
    };

    const handleOnClose = () => {
        dispatch(setFileEditor({...fileEditor, isOpen: false, isFullWidth: false}));
    };

    const handleOnWidthToggle = () => {
        dispatch(setFileEditor({...fileEditor, isFullWidth: !fileEditor.isFullWidth}));
    };

    if (!file) return null;

    return (
        <div className={block()} data-qa="query-file-editor">
            <div className={block('header')}>
                <div className={block('header-side')}>
                    <Icon data={FileIcon} size={16} />
                    <Text variant="subheader-1" ellipsis>
                        {file.name}
                    </Text>
                </div>
                <div className={block('header-side')}>
                    <Button qa="query-file-toggle-width" view="flat" onClick={handleOnWidthToggle}>
                        <Icon
                            data={fileEditor.isFullWidth ? LayoutColumnsIcon : SquareIcon}
                            size={16}
                        />
                    </Button>
                    <Button qa="query-file-close" view="flat" onClick={handleOnClose}>
                        <Icon data={XmarkIcon} size={16} />
                    </Button>
                </div>
            </div>
            {useQueriesKit ? (
                <QueriesKitMonacoEditor
                    key={file.id}
                    className={block('editor')}
                    value={file.content || ''}
                    language="plaintext"
                    theme={theme}
                    onChange={handleOnChange}
                    monacoConfig={MONACO_CONFIG}
                />
            ) : (
                <MonacoEditor
                    className={block('editor')}
                    editorRef={editorRef}
                    value={file.content || ''}
                    language="plaintext"
                    onChange={handleOnChange}
                    monacoConfig={MONACO_CONFIG}
                />
            )}
        </div>
    );
};
