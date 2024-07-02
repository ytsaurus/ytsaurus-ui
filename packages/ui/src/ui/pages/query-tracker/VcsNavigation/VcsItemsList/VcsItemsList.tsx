import React, {FC, useCallback, useMemo} from 'react';
import cn from 'bem-cn-lite';
import './VcsItemsList.scss';
import {useDispatch, useSelector} from 'react-redux';
import {
    selectListArray,
    selectPath,
    selectPreview,
    selectRepositoryUrl,
} from '../../module/repoNavigation/selectors';
import {VcsListFolder} from './VcsListFolder';
import {
    addFileToQuery,
    getFolderContent,
    goBack,
    openFilePreview,
} from '../../module/repoNavigation/actions';
import {VcsListFile} from './VcsListFile';
import {VcsListPreview} from './VcsListPreview';
import {setPreview} from '../../module/repoNavigation/repoNavigationSlice';

const block = cn('vcs-items-list');

export const VcsItemsList: FC = () => {
    const dispatch = useDispatch();
    const list = useSelector(selectListArray);
    const path = useSelector(selectPath);
    const preview = useSelector(selectPreview);
    const repositoryFileUrl = useSelector(selectRepositoryUrl);

    const handleOpenFolder = useCallback(
        (name: string) => {
            dispatch(getFolderContent(name));
        },
        [dispatch],
    );

    const handleShowClick = useCallback(
        (name: string) => {
            dispatch(openFilePreview(name));
        },
        [dispatch],
    );

    const handleBackClick = useCallback(() => {
        dispatch(goBack());
    }, [dispatch]);

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

    const itemsList = useMemo(() => {
        return list.map((item) => {
            const truePath = path ? path + '/' + item.name : item.name;
            return item.type === 'file' ? (
                <VcsListFile
                    key={item.name}
                    url={repositoryFileUrl + truePath}
                    name={item.name}
                    onAddFile={handleAddFile}
                    onShowClick={handleShowClick}
                />
            ) : (
                <VcsListFolder key={item.name} name={item.name} onClick={handleOpenFolder} />
            );
        });
    }, [path, repositoryFileUrl, handleAddFile, handleShowClick, handleOpenFolder, list]);

    if (!list.length) return <div className={block()}>Empty list</div>;

    if (preview.content || preview.name)
        return (
            <VcsListPreview
                preview={preview}
                onAddFile={handleAddFile}
                onClose={handleClosePreview}
            />
        );

    return (
        <div className={block()}>
            {Boolean(path) && <VcsListFolder name="..." onClick={handleBackClick} />}
            {itemsList}
        </div>
    );
};
