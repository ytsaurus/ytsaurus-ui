import React, {type FC, useRef} from 'react';
import MonacoEditor from '../../../../../components/MonacoEditor';
import type * as monaco from 'monaco-editor';
import {type VcsState} from '../../../../../store/reducers/query-tracker/vcsSlice';
import './VcsListPreview.scss';
import cn from 'bem-cn-lite';
import FileTextIcon from '@gravity-ui/icons/svgs/file-text.svg';
import {Alert, Button, Icon, Loader, Tooltip} from '@gravity-ui/uikit';
import XmarkIcon from '@gravity-ui/icons/svgs/xmark.svg';
import FilePlusIcon from '@gravity-ui/icons/svgs/file-plus.svg';
import TextIndentIcon from '@gravity-ui/icons/svgs/text-indent.svg';
import i18n from './i18n';
import listI18n from '../i18n';

const block = cn('vcs-list-preview');

type Props = {
    preview: VcsState['preview'];
    loading?: boolean;
    error?: boolean;
    onAddFile: (name: string) => void;
    onInsertFile: (name: string) => void;
    onClose: () => void;
};

export const VcsListPreview: FC<Props> = ({
    preview,
    loading,
    error,
    onAddFile,
    onInsertFile,
    onClose,
}) => {
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
                    <Tooltip content={i18n('action_insert-to-editor')}>
                        <Button view="flat" disabled={loading || error} onClick={handleInsertClick}>
                            <Icon data={TextIndentIcon} size={16} />
                        </Button>
                    </Tooltip>
                    <Tooltip content={i18n('action_attach-file')}>
                        <Button view="flat" disabled={loading || error} onClick={handleAddFile}>
                            <Icon data={FilePlusIcon} size={16} />
                        </Button>
                    </Tooltip>
                    <Tooltip content={i18n('action_close-preview')}>
                        <Button view="flat" onClick={onClose}>
                            <Icon data={XmarkIcon} size={16} />
                        </Button>
                    </Tooltip>
                </div>
            </div>
            {loading && <Loader />}
            {error && <Alert theme="danger" title={listI18n('alert_error')} />}
            {!loading && !error && (
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
            )}
        </div>
    );
};
