import React, {FC, useRef} from 'react';
import MonacoEditor from '../../../../components/MonacoEditor';
import * as monaco from 'monaco-editor';
import {RepoNavigationState} from '../../module/repoNavigation/repoNavigationSlice';
import './VcsListPreview.scss';
import cn from 'bem-cn-lite';
import FileTextIcon from '@gravity-ui/icons/svgs/file-text.svg';
import {Icon} from '@gravity-ui/uikit';
import Button from '../../../../components/Button/Button';
import XmarkIcon from '@gravity-ui/icons/svgs/xmark.svg';
import FilePlusIcon from '@gravity-ui/icons/svgs/file-plus.svg';

const block = cn('vcs-list-preview');

type Props = {
    preview: RepoNavigationState['preview'];
    onAddFile: (name: string) => void;
    onClose: () => void;
};

export const VcsListPreview: FC<Props> = ({preview, onAddFile, onClose}) => {
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();

    const handleAddFile = () => {
        onAddFile(preview.name);
    };

    return (
        <div className={block()}>
            <div className={block('header')}>
                <div className={block('header-block')}>
                    <Icon data={FileTextIcon} size={16} /> {preview.name}
                </div>
                <div className={block('header-block')}>
                    <Button view="flat" onClick={handleAddFile}>
                        <Icon data={FilePlusIcon} size={16} />
                    </Button>
                    <Button view="flat" onClick={onClose}>
                        <Icon data={XmarkIcon} size={16} />
                    </Button>
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
