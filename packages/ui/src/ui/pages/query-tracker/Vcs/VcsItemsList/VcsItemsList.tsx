import React, {FC, useCallback, useMemo} from 'react';
import cn from 'bem-cn-lite';
import './VcsItemsList.scss';
import {useDispatch, useSelector} from 'react-redux';
import {
    selectCurrentRepository,
    selectListArray,
    selectPath,
    selectPreview,
} from '../../module/vcs/selectors';
import {VcsListFolder} from './VcsListFolder';
import {addFileToQuery, getFolderContent, goBack, openFilePreview} from '../../module/vcs/actions';
import {VcsListFile} from './VcsListFile';
import {VcsListPreview} from './VcsListPreview';
import {setPreview} from '../../module/vcs/vcsSlice';

const block = cn('vcs-items-list');

export const VcsItemsList: FC = () => {
    const dispatch = useDispatch();
    const list = useSelector(selectListArray);
    const path = useSelector(selectPath);
    const preview = useSelector(selectPreview);
    const currentRepository = useSelector(selectCurrentRepository);

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
            let url = item.url;
            if (currentRepository && 'webUrl' in currentRepository) {
                url = currentRepository.webUrl + item.url;
            }
            return item.type === 'file' ? (
                <VcsListFile
                    key={item.name}
                    url={url}
                    name={item.name}
                    onAddFile={handleAddFile}
                    onShowClick={handleShowClick}
                />
            ) : (
                <VcsListFolder key={item.name} name={item.name} onClick={handleOpenFolder} />
            );
        });
    }, [path, currentRepository, handleAddFile, handleShowClick, handleOpenFolder, list]);

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
