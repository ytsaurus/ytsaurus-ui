import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Flex, TextInput} from '@gravity-ui/uikit';

import {getIdFilter, setIdFilter} from '../../../../../store/reducers/operations/incarnations';
import {getOperation} from '../../../../../store/selectors/operations/operation';
import UIFactory from '../../../../../UIFactory';

export function IncarnationsToolbar() {
    const dispatch = useDispatch();

    const idFilter = useSelector(getIdFilter);
    const operation = useSelector(getOperation);

    const handleIdFilterChange = (idFilter: string) => {
        dispatch(setIdFilter({idFilter}));
    };

    const telemetrySetup = UIFactory.IncarnationsTelemetrySetup;

    return (
        <Flex direction={'row'} gap={2} alignItems={'center'} width={800}>
            <TextInput
                placeholder={'Incarnation ID...'}
                value={idFilter}
                onUpdate={handleIdFilterChange}
            />
            {telemetrySetup?.hasTelemtery(operation) && telemetrySetup.renderFilter()}
        </Flex>
    );
}
