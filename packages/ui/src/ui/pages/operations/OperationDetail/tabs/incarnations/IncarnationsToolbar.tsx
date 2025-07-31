import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Checkbox, Flex, Text, TextInput} from '@gravity-ui/uikit';
import {getIdFilter, setIdFilter} from '../../../../../store/reducers/operations/incarnations';

export function IncarnationsToolbar() {
    const dispatch = useDispatch();

    const idFilter = useSelector(getIdFilter);

    const handleIdFilterChange = (idFilter: string) => {
        dispatch(setIdFilter({idFilter}));
    };

    return (
        <Flex direction={'row'} gap={2} alignItems={'center'} width={800}>
            <TextInput
                placeholder={'Incarnation ID...'}
                value={idFilter}
                onUpdate={handleIdFilterChange}
            />
            <Checkbox checked={false} size={'l'}>
                <Text variant={'inherit'} whiteSpace={'nowrap'}>
                    Show incarnations only with external telemetry
                </Text>
            </Checkbox>
        </Flex>
    );
}
