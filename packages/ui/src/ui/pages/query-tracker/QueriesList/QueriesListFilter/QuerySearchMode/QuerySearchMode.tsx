import React, {type FC} from 'react';
import {Select} from '@gravity-ui/uikit';
import {useDispatch, useSelector} from '../../../../../store/redux-hooks';
import {selectQueriesListSearchMode} from '../../../../../store/selectors/query-tracker/queriesList';
import {
    type QueriesListState,
    setSearchMode,
} from '../../../../../store/reducers/query-tracker/queryListSlice';
import i18n from './i18n';

type Props = {
    className?: string;
};

export const QuerySearchMode: FC<Props> = ({className}) => {
    const dispatch = useDispatch();
    const currentMode = useSelector(selectQueriesListSearchMode);

    const handleModeChange = (val: string[]) => {
        dispatch(setSearchMode(val[0] as QueriesListState['searchMode']));
    };

    return (
        <Select<QueriesListState['searchMode']>
            value={[currentMode]}
            onUpdate={handleModeChange}
            className={className}
        >
            <Select.Option value="name">{i18n('value_name')}</Select.Option>
            <Select.Option value="text">{i18n('value_query-text')}</Select.Option>
        </Select>
    );
};
