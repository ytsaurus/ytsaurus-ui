import React, {FC} from 'react';
import noop_ from 'lodash/noop';
import Pagination from '../../../../components/Pagination/Pagination';
import {useQueriesPagination} from '../../hooks/QueriesList';

export const ListPagination: FC = () => {
    const {first, last, goBack, goNext, goFirst} = useQueriesPagination();

    return (
        <Pagination
            size="m"
            first={{
                handler: goFirst,
                disabled: first,
            }}
            previous={{
                handler: goBack,
                disabled: first,
            }}
            next={{
                handler: goNext,
                disabled: last,
            }}
            last={{
                handler: noop_,
                disabled: true,
            }}
        />
    );
};
