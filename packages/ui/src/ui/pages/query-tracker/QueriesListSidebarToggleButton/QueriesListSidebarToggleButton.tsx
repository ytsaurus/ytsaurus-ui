import React from 'react';
import {Button} from '@gravity-ui/uikit';
import Icon from '../../../components/Icon/Icon';
import {useQueriesListSidebarToggle} from '../hooks/QueriesList';

export function QueriesListSidebarToggleButton() {
    const {isQueriesListSidebarVisible, toggleQueriesListSideBarToggle} =
        useQueriesListSidebarToggle();

    return (
        <Button
            view="outlined"
            size="l"
            title={`${isQueriesListSidebarVisible ? 'Hide' : 'Show'} queries list`}
            onClick={toggleQueriesListSideBarToggle}
        >
            <Icon awesome="layout-side-content" size={16} />
        </Button>
    );
}
