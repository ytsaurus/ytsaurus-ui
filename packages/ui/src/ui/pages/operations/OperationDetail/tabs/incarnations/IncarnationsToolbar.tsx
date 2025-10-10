import React from 'react';
import {useDispatch, useSelector} from '../../../../../store/redux-hooks';
import {Flex, TextInput} from '@gravity-ui/uikit';

import {getIdFilter, setIdFilter} from '../../../../../store/reducers/operations/incarnations';

import i18n from './i18n';

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
                placeholder={i18n('placeholder_incarnation-id')}
                value={idFilter}
                onUpdate={handleIdFilterChange}
            />
            {renderAdditionalFilters}
        </Flex>
    );
}
