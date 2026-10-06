import {type ReactNode, useMemo} from 'react';
import {type NavigationMetaProps} from '@gravity-ui/querieskit';

import {type QueryItem} from '../../../../types/query-tracker/api';
import {useQueryMetadata} from '../../QueryMetaTable/useQueryMetadata';

export function useMetadata(query: QueryItem): {
    props: NavigationMetaProps;
    modal: ReactNode;
} {
    const {items, modal} = useQueryMetadata(query);
    const props = useMemo<NavigationMetaProps>(
        () => ({
            data: {
                groups: [{items: items.map(({title, value}) => ({name: title, value}))}],
            },
        }),
        [items],
    );

    return {props, modal};
}
