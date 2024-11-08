import React, {FC, useCallback, useMemo, useState} from 'react';
import {Button, Flex, Icon, Loader} from '@gravity-ui/uikit';
import {Breadcrumbs, BreadcrumbsItem} from '../../../../components/Breadcrumbs';
import FolderTreeIcon from '@gravity-ui/icons/svgs/folder-tree.svg';
import {EditableAsText} from '../../../../components/EditableAsText/EditableAsText';
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
        async (newPath: string | number) => {
            await onPathChange(newPath.toString());
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
        return path.split('/').map((text) => {
            href += `${href ? '/' : ''}` + text;
            return <BreadcrumbsItem key={href}>{text}</BreadcrumbsItem>;
        });
    }, [path]);

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
                    <Breadcrumbs showRoot onAction={handleChangePath}>
                        {items}
                    </Breadcrumbs>
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
