import React, {FC, useCallback, useMemo} from 'react';
import cn from 'bem-cn-lite';
import './VcsItemsList.scss';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {
    selectCurrentRepository,
    selectListArray,
    selectListError,
    selectPath,
    selectPreview,
    selectShowFilter,
} from '../../../../store/selectors/query-tracker/vcs';
import {VcsListFolder} from './VcsListFolder';
import {
    addFileToQuery,
    getContentByPath,
    getFolderContent,
    insertFileToQuery,
    openFilePreview,
} from '../../../../store/actions/query-tracker/vcs';
import {VcsListFile} from './VcsListFile';
import {VcsListPreview} from './VcsListPreview';
import {setPreview} from '../../../../store/reducers/query-tracker/vcsSlice';
import {NoContent} from '../../../../components/NoContent/NoContent';
import {VcsPath} from '../VcsPath';
import {Alert} from '@gravity-ui/uikit';

const block = cn('vcs-items-list');

export const VcsItemsList: FC = () => {
    const dispatch = useDispatch();
    const list = useSelector(selectListArray);
    const path = useSelector(selectPath);
    const preview = useSelector(selectPreview);
    const listError = useSelector(selectListError);
    const showBreadcrumbs = useSelector(selectShowFilter);
    const currentRepository = useSelector(selectCurrentRepository);

    const handleOpenFolder = useCallback(
        (name: string) => {
            dispatch(getFolderContent(name));
        },
        [dispatch],
    );

    const handlePathChange = useCallback(
        async (newPath: string) => {
            await dispatch(getContentByPath(newPath));
        },
        [dispatch],
    );

    const handleShowClick = useCallback(
        (name: string) => {
            dispatch(openFilePreview(name));
        },
        [dispatch],
    );

    const handleClosePreview = useCallback(() => {
        dispatch(setPreview({name: '', content: ''}));
    }, [dispatch]);

    const handleAddFile = useCallback(
        (name: string) => {
            dispatch(setPreview({name: '', content: ''}));
            dispatch(addFileToQuery(name));
        },
        [dispatch],
    );

    const handleInsertFile = useCallback(
        (name: string) => {
            dispatch(insertFileToQuery(name));
        },
        [dispatch],
    );

    const itemsList = useMemo(() => {
        return list.map((item) => {
            let url = item.url;
            if (currentRepository && 'webUrl' in currentRepository) {
                url = currentRepository.webUrl + item.url;
            }

            if (item.type === 'file')
                return (
                    <VcsListFile
                        key={item.name}
                        url={url}
                        name={item.name}
                        onAddFile={handleAddFile}
                        onInsertFile={handleInsertFile}
                        onShowClick={handleShowClick}
                    />
                );

            return <VcsListFolder key={item.name} name={item.name} onClick={handleOpenFolder} />;
        });
    }, [
        list,
        currentRepository,
        handleAddFile,
        handleInsertFile,
        handleShowClick,
        handleOpenFolder,
    ]);

    if (preview.content || preview.name)
        return (
            <VcsListPreview
                preview={preview}
                onAddFile={handleAddFile}
                onInsertFile={handleInsertFile}
                onClose={handleClosePreview}
            />
        );

    return (
        <div className={block()}>
            {showBreadcrumbs && <VcsPath path={path} onPathChange={handlePathChange} />}
            {listError ? (
                <Alert
                    className={block('error')}
                    theme="danger"
                    title="Error"
                    message="Error when retrieving repository content"
                />
            ) : (
                <>
                    {itemsList.length ? (
                        itemsList
                    ) : (
                        <NoContent className={block('empty-block')} warning="Empty list" />
                    )}
                </>
            )}
        </div>
    );
};
