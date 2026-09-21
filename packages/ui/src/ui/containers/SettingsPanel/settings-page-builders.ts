import type React from 'react';
import type {IconProps} from '@gravity-ui/uikit';

import generalIcon from '../../assets/img/svg/tools-icon.svg';

export interface SettingsPage {
    id: string;
    title: string;
    icon: IconProps;
    sections: Array<SettingsSection>;
}

export interface SettingsSection {
    id: string;
    title: string;
    items: Array<SettingsItem>;
}

export interface SettingsItem {
    id: string;
    title: string;
    align?: 'top' | 'center';
    content: React.ReactNode;
}

export function makePage(
    id: string,
    title: string,
    icon: IconProps | undefined,
    items: Array<SettingsItem>,
): SettingsPage {
    return makePageBySections(id, title, icon, [{id: `${id}/${id}`, title, items}]);
}

export function makePageBySections(
    id: string,
    title: string,
    icon: IconProps | undefined,
    sections: Array<SettingsSection>,
) {
    return {id, title, icon: icon || generalIcon, sections};
}

export function makeItem(
    id: string,
    title: string,
    align?: SettingsItem['align'],
    content?: React.ReactNode,
): SettingsItem {
    return {id, title, align, content};
}
