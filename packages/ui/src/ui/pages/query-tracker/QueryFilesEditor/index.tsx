import React, {
    MutableRefObject,
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {AdaptiveTabs} from '@gravity-ui/components';
import {Button, Icon, Text} from '@gravity-ui/uikit';
import closeIcon from '@gravity-ui/icons/svgs/xmark.svg';
import fileIcon from '@gravity-ui/icons/svgs/file.svg';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import {getCurrentDraftFile, getOpenDraftFiles, getQueryDraft} from '../module/query/selectors';
import MonacoEditor, {MonacoEditorConfig} from '../../../components/MonacoEditor';
import {QueryFile} from '../module/api';
import {closeDraftFiles, openDraftFile, updateOpenFile} from '../module/query/actions';

import cn from 'bem-cn-lite';
import './QueryFilesEditor.scss';

type FilesEditorState = ReturnType<typeof useFilesEditor>;
const filesEditorContext = createContext<FilesEditorState>({} as FilesEditorState);

const b = cn('query-files-editor');

const useFilesEditor = (
    files: QueryFile[],
    editor: MutableRefObject<monaco.editor.IStandaloneCodeEditor | undefined>,
) => {
    const dispatch = useDispatch();
    const [fileStates] = useState(
        new Map<string, monaco.editor.ICodeEditorViewState | undefined>(),
    );

    const currentFileName = useSelector(getCurrentDraftFile);
    const fileTabs = useSelector(getOpenDraftFiles);

    const [previousTab, setPreviousTab] = useState('');

    const savePreviousFileState = useCallback(() => {
        if (editor.current && previousTab !== currentFileName) {
            fileStates.set(previousTab, editor.current.saveViewState() ?? undefined);
            setPreviousTab(currentFileName);
        }
    }, [editor.current, previousTab, currentFileName]);

    const closeAllFiles = useCallback(() => {
        fileStates.clear();
        dispatch(closeDraftFiles(...fileTabs));
    }, [fileTabs, dispatch]);

    const closeFile = useCallback(
        (fileName: string) => dispatch(closeDraftFiles(fileName)),
        [dispatch],
    );

    const openFile = useCallback(
        (fileName: string) => dispatch(openDraftFile(fileName)),
        [dispatch],
    );

    const onNewCurrentFile = useCallback(async () => {
        if (!editor.current || !currentFileName) {
            return;
        }

        savePreviousFileState();

        const currentFile = files.find(({name}) => name === currentFileName);
        if (!currentFile) {
            return;
        }

        editor.current.getModel()?.setValue(currentFile.content);

        const existingState = fileStates.get(currentFile.name);
        if (existingState) {
            editor.current.restoreViewState(existingState);
        }

        editor.current.focus();
    }, [editor.current, currentFileName, savePreviousFileState, files]);

    useEffect(() => {
        if (editor.current && currentFileName) {
            onNewCurrentFile();
        }
    }, [editor.current, currentFileName]);

    return {
        currentFileName,
        fileTabs,

        openFile,
        closeFile,
        closeAllFiles,
    };
};

const TabItem = React.memo(function TabItem({id}: {id: string}) {
    const {closeFile, openFile} = useContext(filesEditorContext);
    return (
        <div className={b('file-tab')} onClick={() => openFile(id)}>
            <Icon data={fileIcon} size={16} />
            <Text ellipsis>{id}</Text>
            <Button
                view="flat"
                onClick={(e) => {
                    e.stopPropagation();
                    closeFile(id);
                }}
            >
                <Icon data={closeIcon} size={16} />
            </Button>
        </div>
    );
});

const QueryFilesTabs = React.memo(function QueryFilesTabs({fileTabs}: {fileTabs: string[]}) {
    const {openFile, currentFileName, closeAllFiles} = useContext(filesEditorContext);
    return fileTabs.length > 0 ? (
        <div className={b('header')}>
            <AdaptiveTabs
                activeTab={currentFileName}
                onSelectTab={openFile}
                items={fileTabs.map((id) => ({
                    id,
                    title: <TabItem id={id} />,
                }))}
            />
            <Button view="flat" onClick={closeAllFiles}>
                <Icon data={closeIcon} size={16} />
            </Button>
        </div>
    ) : undefined;
});

export const QueryFilesEditor = React.memo(function QueryFilesEditor() {
    const {files} = useSelector(getQueryDraft);
    const dispatch = useDispatch();
    const editor = useRef<monaco.editor.IStandaloneCodeEditor>();
    const filesEditorState = useFilesEditor(files, editor);
    const {fileTabs, currentFileName} = filesEditorState;

    const updateFileText = useCallback(
        (content: string) => dispatch(updateOpenFile(content)),
        [dispatch],
    );

    const monacoConfig = useMemo<MonacoEditorConfig>(() => {
        return {
            fontSize: 14,
            renderWhitespace: 'boundary',
            lineNumbers: 'off',
        };
    }, []);

    return (
        <filesEditorContext.Provider value={filesEditorState}>
            {currentFileName ? (
                <div className={b()}>
                    <QueryFilesTabs fileTabs={fileTabs} />
                    <MonacoEditor
                        editorRef={editor}
                        monacoConfig={monacoConfig}
                        value={''}
                        onChange={updateFileText}
                    />
                </div>
            ) : undefined}
        </filesEditorContext.Provider>
    );
});
