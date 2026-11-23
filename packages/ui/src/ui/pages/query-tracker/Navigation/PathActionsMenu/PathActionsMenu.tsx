import React from 'react';
import {Button, DropdownMenu, type DropdownMenuProps, Icon} from '@gravity-ui/uikit';
import {NavigationActionsMenu} from '@gravity-ui/querieskit/components/NavigationActionsMenu';
import {FileArrowRightOut} from '@gravity-ui/icons';
import TextIndentIcon from '@gravity-ui/icons/svgs/text-indent.svg';
import type {QueryEngine} from '../../../../../shared/constants/engines';
import {NewQueryPromt} from '../../NewQueryButton/NewQueryButton';
import {type PathActionsNode, usePathActions} from './usePathActions';
import i18n from './i18n';

export type Props = {
    node: PathActionsNode;
    engine: QueryEngine;
    grouped?: boolean;
    open: boolean;
    onOpenToggle: () => void;
};

export function PathActionsMenu({node, engine, open, onOpenToggle, grouped = false}: Props) {
    const {groups, newQueryPromptProps} = usePathActions({node, engine, grouped});

    const renderSwitcher: DropdownMenuProps<PathActionsNode>['renderSwitcher'] = (props) => (
        <Button view="flat" {...props} aria-label={i18n('action_insert-into-editor')}>
            <Icon data={grouped ? FileArrowRightOut : TextIndentIcon} size={16} />
        </Button>
    );

    let menu;
    if (grouped) {
        menu = (
            <NavigationActionsMenu
                arg={node}
                groups={groups}
                open={open}
                onOpenToggle={onOpenToggle}
                renderSwitcher={renderSwitcher}
            />
        );
    } else {
        menu = (
            <DropdownMenu
                open={open}
                onOpenToggle={onOpenToggle}
                renderSwitcher={renderSwitcher}
                items={groups.map(({title, actions}) => ({
                    text: title,
                    items: actions.map(({title: text, onClick}) => ({
                        text,
                        action: (event) => {
                            event.stopPropagation();
                            onClick(node);
                        },
                    })),
                }))}
                onSwitcherClick={(event) => event.stopPropagation()}
            />
        );
    }

    return (
        <>
            {menu}
            <NewQueryPromt {...newQueryPromptProps} />
        </>
    );
}
