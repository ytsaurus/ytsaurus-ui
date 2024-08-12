import React, {FC, useCallback, useMemo, useState} from 'react';
import {
    Breadcrumbs,
    Button,
    FirstDisplayedItemsCount,
    Flex,
    Icon,
    LastDisplayedItemsCount,
    Loader,
} from '@gravity-ui/uikit';
import FolderTreeIcon from '@gravity-ui/icons/svgs/folder-tree.svg';
import {EditableAsText} from '../../../../components/EditableAsText/EditableAsText';
import {BreadcrumbsItem as BreadcrumbsItemType} from '@gravity-ui/uikit/build/esm/components/Breadcrumbs/Breadcrumbs';
import './VcsPath.scss';
import cn from 'bem-cn-lite';

const block = cn('vcs-path');

type Props = {
    path: string;
    onPathChange: (path: string) => void;
};

export const VcsPath: FC<Props> = ({path, onPathChange}) => {
    const [isEdit, setEdit] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChangePath = useCallback(
        async (newPath: string) => {
            await onPathChange(newPath);
        },
        [onPathChange],
    );

    const handleRootClick = useCallback(async () => {
        await handleChangePath('');
    }, [handleChangePath]);

    const handleSave = useCallback(
        async (value?: string) => {
            setLoading(true);
            if (!value) {
                await handleRootClick();
            } else {
                await handleChangePath(value.startsWith('/') ? value.slice(1) : value);
            }
            setLoading(false);
        },
        [handleRootClick, handleChangePath],
    );

    const items = useMemo(() => {
        let href = '';
        return path.split('/').reduce<BreadcrumbsItemType[]>((acc, text) => {
            href += `${href ? '/' : ''}` + text;
            acc.push({
                text,
                href,
                action: (function (linkPath: string) {
                    return (e) => {
                        e.preventDefault();
                        handleChangePath(linkPath);
                    };
                })(href),
            });
            return acc;
        }, []);
    }, [handleChangePath, path]);

    if (loading)
        return (
            <Flex justifyContent="center" alignItems="center">
                <Loader />
            </Flex>
        );

    return (
        <div className={block({open: isEdit})}>
            {!isEdit && (
                <>
                    <Button size="s" view="flat" onClick={handleRootClick}>
                        <Icon data={FolderTreeIcon} size={16} />
                    </Button>
                    <Breadcrumbs
                        items={items}
                        firstDisplayedItemsCount={FirstDisplayedItemsCount[path ? 'Zero' : 'One']}
                        lastDisplayedItemsCount={LastDisplayedItemsCount.One}
                    />
                </>
            )}
            <EditableAsText
                withControls
                text={path}
                onChange={handleSave}
                onModeChange={setEdit}
                saveButtonView="action"
            >
                {''}
            </EditableAsText>
        </div>
    );
};
