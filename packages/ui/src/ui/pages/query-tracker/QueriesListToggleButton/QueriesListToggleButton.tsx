import React from 'react';
import {Button} from '@gravity-ui/uikit';
import {useSelector, useDispatch} from 'react-redux';
import Icon from '../../../components/Icon/Icon';
import {TOGGLE_QUERIES_LIST} from '../module/ui_settings/actions';
import {getQueriesListSetting} from '../module/ui_settings/selectors';

export function QueriesListToggleButton() {
    const isShowQueriesSettingPanel = useSelector(getQueriesListSetting);
    const dispatch = useDispatch();

    const handleClick = () => {
        dispatch({ type: TOGGLE_QUERIES_LIST });
    }

    return (
        <Button size="l" title={`${isShowQueriesSettingPanel ? "Hide" : "Show" } queries list`} onClick={handleClick}>
            <Icon awesome="layout-side-content" size={16} />
        </Button>
    );
}
