import React, {
    ReactNode,
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import cn from 'bem-cn-lite';
import {QueryFile} from '../module/api';
import {
    Button,
    Icon,
    IconData,
    Link,
    List,
    Tabs,
    TabsItemProps,
    Text,
    TextInput,
} from '@gravity-ui/uikit';
import linkIcon from '@gravity-ui/icons/svgs/link.svg';
import fileIcon from '@gravity-ui/icons/svgs/file.svg';
import pencilIcon from '@gravity-ui/icons/svgs/pencil.svg';
import trashIcon from '@gravity-ui/icons/svgs/trash-bin.svg';
import clipIcon from '@gravity-ui/icons/svgs/paperclip.svg';
import plusIcon from '@gravity-ui/icons/svgs/plus.svg';
import checkIcon from '@gravity-ui/icons/svgs/check.svg';
import closeIcon from '@gravity-ui/icons/svgs/xmark.svg';
import restoreIcon from '@gravity-ui/icons/svgs/arrow-rotate-left.svg';
import uploadIcon from '@gravity-ui/icons/svgs/arrow-up-from-square.svg';
import {ButtonWithPopup} from '../../../components/ButtonPopup';

import './QueryFilesButton.scss';

const b = cn('query-files-popup');

type QueryFilesState = ReturnType<typeof useQueryFiles>;

const fileIsNew = (file: QueryFile) => [!file.name, !file.content].some(Boolean);

const useQueryFiles = (
    files: QueryFile[],
    queryId: string,
    updateFiles: (files: QueryFile[]) => void,
) => {
    const [deletedFiles, setDeletedFiles] = useState<QueryFile[]>([]);
    useEffect(() => setDeletedFiles([]), [queryId]);
    const [filesMap, setFilesMap] = useState(new Map<string, QueryFile>());
    const hasNewFiles = useMemo(() => files.some(fileIsNew), [files]);
    useEffect(() => setFilesMap(new Map(files.map((f) => [f.name, f]))), [files]);
    const upsertFile = useCallback(
        (file: QueryFile, updating?: QueryFile) => {
            const existing = filesMap.get(file.name);
            if (existing && existing !== updating) {
                return 'This name is already in use';
            }
            const getFilesToUpdate = () => {
                if (!updating) {
                    return [...files, file];
                }

                const index = files.indexOf(updating);
                return [...files.slice(0, index), file, ...files.slice(index + 1)];
            };
            updateFiles(getFilesToUpdate());
            return;
        },
        [files, filesMap, updateFiles],
    );
    const createFile = useCallback(
        (fileType: QueryFile['type']) => {
            if (hasNewFiles) {
                return;
            }
            upsertFile({type: fileType, name: '', content: ''});
        },
        [upsertFile, hasNewFiles],
    );
    const discardFile = useCallback(
        (file: QueryFile) => updateFiles(files.filter((f) => f !== file)),
        [files],
    );
    const removeFile = useCallback(
        (file: QueryFile) => {
            setDeletedFiles([...deletedFiles, file]);
            discardFile(file);
        },
        [discardFile, deletedFiles],
    );
    const restoreFile = useCallback(
        (file: QueryFile) => {
            const result = upsertFile(file);
            if (!result) {
                setDeletedFiles([...deletedFiles.filter((f) => f !== file)]);
            }
            return result;
        },
        [upsertFile, deletedFiles],
    );
    return {
        files,
        deletedFiles,
        createFile,
        upsertFile,
        removeFile,
        restoreFile,
        discardFile,
    };
};

const QueryFilesContext = createContext<QueryFilesState>({} as QueryFilesState);

type FileItemWrapperProps = {
    body: React.ReactNode;
    controls: React.ReactNode;
    customModifier?: string;
    link?: string;
};

const FileItemWrapper = ({body, controls, customModifier, link}: FileItemWrapperProps) => {
    const bodyElement = (
        <div className={b('file-item-body', customModifier ? {[customModifier]: true} : null)}>
            {body}
        </div>
    );
    return (
        <div className={b('file-item')}>
            {link ? (
                <Link view="secondary" href={link} target="_blank">
                    {bodyElement}
                </Link>
            ) : (
                bodyElement
            )}
            <div
                className={b(
                    'file-item-controls',
                    customModifier ? {[customModifier]: true} : null,
                )}
            >
                {controls}
            </div>
        </div>
    );
};

const ControlButton = ({
    icon,
    disabled,
    action,
}: {
    icon: IconData;
    disabled?: boolean;
    action: () => void;
}) => (
    <Button size="xs" view="flat" disabled={disabled} onClick={action}>
        <Icon data={icon} size={16} />
    </Button>
);

const FileTypeIcon = ({file}: {file: QueryFile}) => (
    <Icon
        className={b('file-item-icon')}
        data={file.type === 'url' ? linkIcon : fileIcon}
        size={16}
    />
);

const DeletedFileItem = ({file}: {file: QueryFile}) => {
    const [error, setError] = useState('');
    const textColor = useMemo(() => (error ? 'danger' : undefined), [error]);
    const {restoreFile} = useContext(QueryFilesContext);
    const tryRestore = useCallback(() => {
        setError(restoreFile(file) ?? '');
    }, [file, restoreFile]);
    return (
        <FileItemWrapper
            body={
                <>
                    <FileTypeIcon file={file} />
                    <Text ellipsis color={textColor}>
                        {file.name}
                    </Text>
                    <Text color={textColor}>{error}</Text>
                </>
            }
            controls={<ControlButton icon={restoreIcon} action={tryRestore} />}
            link={file.type === 'url' ? file.content : undefined}
            customModifier="deleted"
        />
    );
};

const ViewFileItem = ({file, toggleEdit}: {file: QueryFile; toggleEdit: () => void}) => {
    const {removeFile} = useContext(QueryFilesContext);
    const remove = useCallback(() => removeFile(file), [file, removeFile]);
    return (
        <FileItemWrapper
            body={
                <>
                    <FileTypeIcon file={file} />
                    <Text ellipsis>{file.name}</Text>
                </>
            }
            controls={
                <>
                    <ControlButton icon={pencilIcon} action={toggleEdit} />
                    <ControlButton icon={trashIcon} action={remove} />
                </>
            }
            link={file.type === 'url' ? file.content : undefined}
        />
    );
};

const UploadButton = ({file}: {file: QueryFile}) => {
    const {upsertFile} = useContext(QueryFilesContext);
    const inputRef = useRef<HTMLInputElement>(null);
    const readFileAsync = async (file: File) =>
        new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = () => reject(reader.error);
            reader.readAsText(file);
        });
    const onFile = async ({target}: React.ChangeEvent<HTMLInputElement>) => {
        const uploaded = target.files && target.files[0];
        if (!uploaded) {
            return;
        }

        try {
            const content = await readFileAsync(uploaded);
            upsertFile({...file, content}, file);
        } catch (e) {
            console.error(`Error reading file: ${e}`);
        }
    };
    return (
        <>
            <ControlButton icon={uploadIcon} action={() => inputRef.current?.click()} />
            <input ref={inputRef} type="file" style={{display: 'none'}} onChange={onFile} />
        </>
    );
};

const EditFileItem = ({file, toggleEdit}: {file: QueryFile; toggleEdit: () => void}) => {
    const {upsertFile, discardFile} = useContext(QueryFilesContext);
    const [error, setError] = useState('');
    const validationState = useMemo(() => (error ? 'invalid' : undefined), [error]);
    const [name, setName] = useState(file.name);
    const [content, setContent] = useState(file.content);
    useEffect(() => setContent(file.content), [file]);
    const invalid = useMemo(
        () => [validationState, !name, !content].some(Boolean),
        [validationState, name, content],
    );
    const close = () => {
        if (fileIsNew(file)) {
            discardFile(file);
        }
        toggleEdit();
    };
    useEffect(() => setError(''), [name]);
    const trySave = () => {
        const error = upsertFile({name, content, type: file.type}, file);
        setError(error ?? '');
        if (!error) {
            toggleEdit();
        }
    };
    const isUrl = useMemo(() => file.type === 'url', [file]);
    return (
        <FileItemWrapper
            customModifier="edit"
            body={
                <>
                    <TextInput
                        autoFocus
                        errorMessage={error}
                        validationState={validationState}
                        value={name}
                        onUpdate={setName}
                        placeholder="File name"
                    />
                    <TextInput
                        validationState={validationState}
                        value={content}
                        onUpdate={setContent}
                        placeholder={isUrl ? 'Link to file' : 'File contents'}
                    />
                </>
            }
            controls={
                <>
                    {isUrl ? undefined : <UploadButton file={file} />}
                    <ControlButton icon={checkIcon} disabled={invalid} action={trySave} />
                    <ControlButton icon={closeIcon} action={close} />
                </>
            }
        />
    );
};

const FileItem = ({file}: {file: QueryFile}) => {
    const newFile = useMemo(() => fileIsNew(file), [file]);
    const [editMode, setEditMode] = useState(newFile);
    useEffect(() => setEditMode(editMode || newFile), [newFile]);
    const toggleEdit = useCallback(() => {
        setEditMode(!editMode);
    }, [editMode]);
    return editMode ? (
        <EditFileItem file={file} toggleEdit={toggleEdit} />
    ) : (
        <ViewFileItem file={file} toggleEdit={toggleEdit} />
    );
};

const QueryFileList = ({
    items,
    template,
}: {
    items: QueryFile[];
    template: (file: QueryFile) => ReactNode;
}): React.JSX.Element => (
    <List
        className={b('file-list')}
        items={items}
        virtualized={false}
        sortable={false}
        filterable={false}
        renderItem={template}
    />
);

enum FileTabs {
    Current = 'current',
    Deleted = 'deleted',
}

export const QueryFilesButton = ({
    files,
    queryId,
    onChange,
}: {
    files: QueryFile[];
    queryId: string;
    onChange: (files: QueryFile[]) => void;
}) => {
    const context = useQueryFiles(files, queryId, onChange);
    const {deletedFiles, createFile} = context;
    const [activeTab, setActiveTab] = useState(FileTabs.Current);
    const createNewFile = useCallback(
        (fileType: QueryFile['type']) => {
            setActiveTab(FileTabs.Current);
            createFile(fileType);
        },
        [createFile],
    );
    const tabs = useMemo<TabsItemProps[]>(
        () => [
            {
                id: FileTabs.Current,
                title: 'Current',
                counter: files.length,
                disabled: !files.length,
            },
            {
                id: FileTabs.Deleted,
                title: 'Deleted',
                counter: deletedFiles.length,
                disabled: !deletedFiles.length,
            },
        ],
        [files, deletedFiles, activeTab],
    );
    useEffect(() => {
        if (activeTab === FileTabs.Current && !files.length && deletedFiles.length) {
            setActiveTab(FileTabs.Deleted);
        }
        if (activeTab === FileTabs.Deleted && !deletedFiles.length) {
            setActiveTab(FileTabs.Current);
        }
    }, [files, deletedFiles]);
    return (
        <ButtonWithPopup
            header={
                <div className={b('header')}>
                    <Text variant="subheader-3">Attachments</Text>
                    <Text variant="subheader-3" color="secondary">
                        {files.length}
                    </Text>
                </div>
            }
            icon={clipIcon}
            counter={files.length}
        >
            <div className={b()}>
                <QueryFilesContext.Provider value={context}>
                    <Tabs
                        activeTab={activeTab}
                        items={tabs}
                        onSelectTab={(tabId: FileTabs) => setActiveTab(tabId)}
                    />
                    {activeTab === FileTabs.Current ? (
                        <QueryFileList
                            items={files}
                            template={(file: QueryFile) => <FileItem file={file} />}
                        />
                    ) : (
                        <QueryFileList
                            items={deletedFiles}
                            template={(file: QueryFile) => <DeletedFileItem file={file} />}
                        />
                    )}
                </QueryFilesContext.Provider>
                <div className={b('footer')}>
                    <Button width="auto" onClick={() => createNewFile('raw_inline_data')}>
                        <Icon data={plusIcon} size={16} />
                        Add file
                    </Button>
                    <Button width="auto" onClick={() => createNewFile('url')}>
                        <Icon data={plusIcon} size={16} />
                        Add URL
                    </Button>
                </div>
            </div>
        </ButtonWithPopup>
    );
};
