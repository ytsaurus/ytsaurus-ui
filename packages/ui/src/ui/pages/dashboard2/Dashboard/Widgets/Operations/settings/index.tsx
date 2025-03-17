// import React from 'react';
// import {useDispatch, useSelector} from 'react-redux';
// import {ConfigItem} from '@gravity-ui/dashkit';

// import {editItem, selectEdittingItem} from '../../../../../../store/reducers/dashboard2/dashboard';

// import UIFactory from '../../../../../../UIFactory';

export function useOperationsSettings() {
    return [
        {
            type: 'text',
            name: 'name',
            caption: 'Name',
            extras: {
                placeholder: 'Operations',
            },
        },
        {
            name: 'responsibles',
            type: 'acl-subjects',
            caption: 'Responsible',
            required: true,
            extras: {
                placeholder: 'Enter name or login',
                allowedTypes: ['users'],
            },
        },
    ];
}
