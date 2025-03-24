import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Button, Flex} from '@gravity-ui/uikit';

import {RowWithName} from '../../../containers/AppNavigation/TopRowContent/SectionName';
import {Page} from '../../../../shared/constants/settings';
import {toggleEditing} from '../../../store/reducers/dashboard2/dashboard';
import {getIsEditing} from '../../../store/selectors/dashboard2/dashboard';

export function DashboardTopRow() {
    const dispatch = useDispatch();

    const isEditing = useSelector(getIsEditing);

    const onEdit = () => {
        dispatch(toggleEditing());
    };

    return (
        <RowWithName page={Page.DASHBOARD2}>
            <Flex grow={true} justifyContent={'flex-end'}>
                <Button size="m" view={isEditing ? 'outlined' : 'action'} onClick={onEdit}>
                    {isEditing ? 'Save dashboard' : 'Edit dashboard'}
                </Button>
            </Flex>
        </RowWithName>
    );
}
