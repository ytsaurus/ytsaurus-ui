import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Flex, TextInput} from '@gravity-ui/uikit';

import {getIdFilter, setIdFilter} from '../../../../../store/reducers/operations/incarnations';

export function IncarnationsToolbar() {
    return <IncarnationsToolbarTemplate />;
}

export type IncarnationsToolbarTemplateProps = {
    renderAdditionalFilters?: React.ReactNode;
};

export function IncarnationsToolbarTemplate(props: IncarnationsToolbarTemplateProps) {
    const {renderAdditionalFilters} = props;

    const dispatch = useDispatch();

    const idFilter = useSelector(getIdFilter);

    const handleIdFilterChange = (idFilter: string) => {
        dispatch(setIdFilter({idFilter}));
    };

    return (
        <Flex direction={'row'} gap={2} alignItems={'center'} width={800}>
            <TextInput
                placeholder={'Incarnation id...'}
                value={idFilter}
                onUpdate={handleIdFilterChange}
            />
            {renderAdditionalFilters}
        </Flex>
    );
}
