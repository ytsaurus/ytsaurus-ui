import React, {FC, useRef} from 'react';
import MonacoEditor from '../../../../components/MonacoEditor';
import * as monaco from 'monaco-editor';
import {VcsState} from '../../../../store/reducers/queries/vcsSlice';
import './VcsListPreview.scss';
import cn from 'bem-cn-lite';
import FileTextIcon from '@gravity-ui/icons/svgs/file-text.svg';
import {Button, Icon, Tooltip} from '@gravity-ui/uikit';
import XmarkIcon from '@gravity-ui/icons/svgs/xmark.svg';
import FilePlusIcon from '@gravity-ui/icons/svgs/file-plus.svg';
import TextIndentIcon from '@gravity-ui/icons/svgs/text-indent.svg';

const block = cn('vcs-list-preview');

type Props = {
    preview: VcsState['preview'];
    onAddFile: (name: string) => void;
    onInsertFile: (name: string) => void;
    onClose: () => void;
};

export const VcsListPreview: FC<Props> = ({preview, onAddFile, onInsertFile, onClose}) => {
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();

    const handleAddFile = () => {
        onAddFile(preview.name);
    };

    const handleInsertClick = () => {
        onInsertFile(preview.name);
    };

    return (
        <div className={block()}>
            <div className={block('header')}>
                <div className={block('header-block')}>
                    <Icon data={FileTextIcon} size={16} /> {preview.name}
                </div>
                <div className={block('header-block')}>
                    <Tooltip content="Insert into editor">
                        <Button view="flat" onClick={handleInsertClick}>
                            <Icon data={TextIndentIcon} size={16} />
                        </Button>
                    </Tooltip>
                    <Tooltip content="Attach file to query">
                        <Button view="flat" onClick={handleAddFile}>
                            <Icon data={FilePlusIcon} size={16} />
                        </Button>
                    </Tooltip>
                    <Tooltip content="Close preview">
                        <Button view="flat" onClick={onClose}>
                            <Icon data={XmarkIcon} size={16} />
                        </Button>
                    </Tooltip>
                </div>
            </div>
            <MonacoEditor
                className={block('editor')}
                editorRef={editorRef}
                value={preview.content}
                language="plaintext"
                onChange={() => {}}
                monacoConfig={{
                    fontSize: 14,
                    language: 'plaintext',
                    renderWhitespace: 'boundary',
                    readOnly: true,
                }}
            />
        </div>
    );
};
