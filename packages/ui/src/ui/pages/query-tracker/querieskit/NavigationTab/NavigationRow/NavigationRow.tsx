import React, {useState} from 'react';
import {NavigationItemRow} from '@gravity-ui/querieskit/components/NavigationItemRow';

import {type NavigationTabItem, getNavigationItemRowConfig} from '../adapters';
import {
    NavigationItemActions,
    type NavigationItemMenu,
} from '../NavigationItemActions/NavigationItemActions';

type Props = {item: NavigationTabItem};

export function NavigationRow({item}: Props) {
    const [openMenu, setOpenMenu] = useState<NavigationItemMenu>();

    const handleOpenChange = (menu: NavigationItemMenu, open: boolean) => {
        setOpenMenu((current) => {
            if (open) {
                return menu;
            }
            return current === menu ? undefined : current;
        });
    };

    return (
        <NavigationItemRow
            item={item}
            {...getNavigationItemRowConfig(item)}
            actionsMenuOpen={Boolean(openMenu)}
            renderMenuTrigger={
                item.disabled
                    ? undefined
                    : () => (
                          <NavigationItemActions
                              node={item.node}
                              openMenu={openMenu}
                              onOpenChange={handleOpenChange}
                          />
                      )
            }
        />
    );
}
