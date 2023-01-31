import React, {useCallback} from 'react';
import {useSelector, useDispatch} from 'react-redux';

import {Checkbox} from '@gravity-ui/uikit';

import {getIsAllSelected} from '../../../../store/selectors/navigation/content/map-node';
import {selectAll} from '../../../../store/actions/navigation/content/map-node';

export default function Chooser() {
    const dispatch = useDispatch();
    const isAllSelected = useSelector(getIsAllSelected);
    const handleSelectChange = useCallback(() => {
        dispatch(selectAll(isAllSelected));
    }, [dispatch, isAllSelected]);

    return <Checkbox id="all" size="l" checked={isAllSelected} onChange={handleSelectChange} />;
}
