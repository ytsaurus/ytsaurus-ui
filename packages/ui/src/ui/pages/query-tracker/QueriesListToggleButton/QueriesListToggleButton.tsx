import React from 'react';
import {Button} from '@gravity-ui/uikit';
import {useSelector, useDispatch} from 'react-redux';
import Icon from '../../../components/Icon/Icon';
import {TOGGLE_QUERIES_LIST_SIDEBAR} from '../module/ui_settings/actions';
import {getVisibilityQueriesListUiSetting} from '../module/ui_settings/selectors';

export function QueriesListToggleButton() {
    const isShowQueriesListSidebar = useSelector(getVisibilityQueriesListUiSetting);
    const dispatch = useDispatch();

    const handleClick = () => {
        dispatch({ type: TOGGLE_QUERIES_LIST_SIDEBAR });
    }

    return (
        <Button size="l" title={`${isShowQueriesListSidebar ? "Hide" : "Show" } queries list`} onClick={handleClick}>
            <Icon awesome="layout-side-content" size={16} />
        </Button>
    );
}
