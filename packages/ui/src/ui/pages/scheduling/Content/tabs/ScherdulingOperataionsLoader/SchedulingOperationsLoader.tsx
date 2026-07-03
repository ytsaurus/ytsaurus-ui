import React from 'react';
import {selectSchedulingOperationsLoadingStatus} from '../../../../../store/selectors/scheduling/expanded-pools';
import {useSelector} from '../../../../../store/redux-hooks';
import Loader from '../../../../../components/Loader/Loader';

function SchedulingOperationsLoader() {
    const loading = useSelector(selectSchedulingOperationsLoadingStatus);
    return <Loader visible={loading} />;
}

export default React.memo(SchedulingOperationsLoader);
