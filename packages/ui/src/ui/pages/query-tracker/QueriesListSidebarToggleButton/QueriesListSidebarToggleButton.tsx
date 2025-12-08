import React from 'react';
import {Button} from '@gravity-ui/uikit';
import Icon from '../../../components/Icon/Icon';
import {useQueriesListSidebarToggle} from '../hooks/QueriesList';
import i18n from './i18n';

export function QueriesListSidebarToggleButton() {
    const {isQueriesListSidebarVisible, toggleQueriesListSideBarToggle} =
        useQueriesListSidebarToggle();

    return (
        <Button
            view="outlined"
            size="l"
            title={
                isQueriesListSidebarVisible
                    ? i18n('context_hide-queries-list')
                    : i18n('context_show-queries-list')
            }
            onClick={toggleQueriesListSideBarToggle}
        >
            <Icon awesome="layout-side-content" size={16} />
        </Button>
    );
}
