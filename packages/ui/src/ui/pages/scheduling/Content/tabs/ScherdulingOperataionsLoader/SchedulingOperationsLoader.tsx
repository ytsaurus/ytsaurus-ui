import React from 'react';
import {getSchedulingOperationsLoadingStatus} from '../../../../../store/selectors/scheduling/expanded-pools';
import {useSelector} from '../../../../../store/redux-hooks';
import Loader from '../../../../../components/Loader/Loader';

function SchedulingOperationsLoader() {
    const loading = useSelector(getSchedulingOperationsLoadingStatus);
    return <Loader visible={loading} />;
}

export default React.memo(SchedulingOperationsLoader);
