import produce from 'immer';
import {RootState} from '../../../../../store/reducers';
import {initialState} from '../../../../../store/reducers/navigation/tabs/schema/schema';
import {updateIfChanged} from '../../../../../utils/utils';

export const schemaParams = {
    schemaColumn: {
        stateKey: 'navigation.tabs.schema.column',
        initialState: initialState.column,
    },
};

export function getNavigationSchemaPreparedState(state: RootState, {query}: {query: RootState}) {
    return produce(state, (draft) => {
        updateIfChanged(
            draft.navigation.tabs.schema,
            'column',
            query.navigation.tabs.schema.column,
        );
    });
}
