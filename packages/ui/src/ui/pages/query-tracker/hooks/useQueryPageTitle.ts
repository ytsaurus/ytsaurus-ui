import {useEffect} from 'react';
import {useDispatch, useSelector} from '../../../store/redux-hooks';
import {updateTitle} from '../../../store/actions/global';
import format from '../../../common/hammer/format';
import {selectCurrentQuery} from '../../../store/selectors/query-tracker/query';

export function useQueryPageTitle() {
    const dispatch = useDispatch();
    const query = useSelector(selectCurrentQuery);
    useEffect(() => {
        if (!query?.id) return;
        const startedAt = query.start_time
            ? format.DateTime(query.start_time, {format: 'short'})
            : '';
        dispatch(
            updateTitle({
                path: `${query.annotations?.title || ''} ${query.state?.toUpperCase() || ''} ${startedAt} @ ${query.engine}`,
            }),
        );
    }, [dispatch, query]);
}
