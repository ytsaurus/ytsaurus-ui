import React, {FC, useRef} from 'react';
import {setFileEditor} from '../../../store/reducers/query-tracker/queryFilesFormSlice';
import {selectFileEditorConfig} from '../../../store/selectors/query-tracker/queryFilesForm';
import {changeQueryFile} from '../../../store/actions/query-tracker/queryFilesForm';
import {useDispatch, useSelector} from 'react-redux';
import FileIcon from '@gravity-ui/icons/svgs/file.svg';
import XmarkIcon from '@gravity-ui/icons/svgs/xmark.svg';
import SquareIcon from '@gravity-ui/icons/svgs/square.svg';
import LayoutColumnsIcon from '@gravity-ui/icons/svgs/layout-columns.svg';
import {Button, Icon, Text} from '@gravity-ui/uikit';
import './FileEditor.scss';
import cn from 'bem-cn-lite';
import MonacoEditor, {MonacoEditorConfig} from '../../../components/MonacoEditor';
import * as monaco from 'monaco-editor';

const block = cn('file-editor');

const MONACO_CONFIG: MonacoEditorConfig = {
    fontSize: 14,
    language: 'plaintext',
    renderWhitespace: 'boundary',
    minimap: {
        enabled: true,
    },
};

export const FileEditor: FC = () => {
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
        <div className={block()}>
            <div className={block('header')}>
                <div className={block('header-side')}>
                    <Icon data={FileIcon} size={16} />
                    <Text variant="subheader-1" ellipsis>
                        {file.name}
                    </Text>
                </div>
                <div className={block('header-side')}>
                    <Button view="flat" onClick={handleOnWidthToggle}>
                        <Icon
                            data={fileEditor.isFullWidth ? LayoutColumnsIcon : SquareIcon}
                            size={16}
                        />
                    </Button>
                    <Button view="flat" onClick={handleOnClose}>
                        <Icon data={XmarkIcon} size={16} />
                    </Button>
                </div>
            </div>
            <MonacoEditor
                className={block('editor')}
                editorRef={editorRef}
                value={file.content || ''}
                language="plaintext"
                onChange={handleOnChange}
                monacoConfig={MONACO_CONFIG}
            />
        </div>
    );
};
