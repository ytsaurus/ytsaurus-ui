import React, {FC, useCallback, useState} from 'react';
import {Button, DropdownMenu, Icon, Toaster} from '@gravity-ui/uikit';
import ArrowShapeTurnUpRightIcon from '@gravity-ui/icons/svgs/arrow-shape-turn-up-right.svg';
import ChevronUpIcon from '@gravity-ui/icons/svgs/chevron-up.svg';
import ChevronDownIcon from '@gravity-ui/icons/svgs/chevron-down.svg';
import {SHARED_QUERY_ACO, getCurrentQueryACO} from '../../module/query/selectors';
import {toggleShareQuery} from '../../module/query/actions';
import {useDispatch, useSelector} from 'react-redux';
import {isSupportedShareQuery} from '../../module/query_aco/selectors';
import {useToggle} from 'react-use';
import './index.scss';
import cn from 'bem-cn-lite';

const b = cn('query-share-button');
const toaster = new Toaster();

export const ShareButton: FC = () => {
    const dispatch = useDispatch();
    const [sending, setSending] = useState(false);
    const [open, toggleDropdown] = useToggle(false);
    const showShareButton = useSelector(isSupportedShareQuery);
    const queryAco = useSelector(getCurrentQueryACO);
    const isShared = queryAco.includes(SHARED_QUERY_ACO);

    const handleToggleQuery = useCallback(async () => {
        try {
            setSending(true);
            await dispatch(toggleShareQuery());
        } finally {
            setSending(false);
        }
    }, [dispatch]);

    const handleToggleShareQuery = useCallback(async () => {
        if (!isShared) {
            await handleToggleQuery();
        }

        navigator.clipboard.writeText(window.location.href);
        toaster.add({
            name: '',
            autoHiding: 5000,
            theme: 'success',
            title: 'Query successful shared',
            content: 'The link to your Query is published and copied to the clipboard',
            actions: [
                {
                    label: 'Unpublish',
                    onClick: handleToggleQuery,
                },
            ],
        });
    }, [handleToggleQuery, isShared]);

    if (!showShareButton) return null;

    return (
        <div className={b()}>
            <Button
                onClick={handleToggleShareQuery}
                view={isShared ? 'flat-info' : 'flat'}
                pin={isShared ? 'round-brick' : undefined}
                selected={isShared}
                loading={sending}
            >
                <Icon data={ArrowShapeTurnUpRightIcon} width={16} /> {isShared ? 'Shared' : 'Share'}
            </Button>
            {isShared && (
                <DropdownMenu
                    renderSwitcher={(props) => (
                        <Button {...props} view="flat" selected pin="brick-round">
                            <Icon size={16} data={open ? ChevronUpIcon : ChevronDownIcon} />
                        </Button>
                    )}
                    onSwitcherClick={toggleDropdown}
                    items={[
                        {
                            action: handleToggleQuery,
                            text: 'Unpublish query',
                        },
                    ]}
                />
            )}
        </div>
    );
};
