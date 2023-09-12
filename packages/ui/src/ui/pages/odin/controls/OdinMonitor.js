import React, {useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import cn from 'bem-cn-lite';

import LoadDataHandler from '../../../components/LoadDataHandler/LoadDataHandler';
import AvailabilityMonitor from './AvailabilityMonitor';

import {getExtendedInfo, getMetricAvailability} from '../_selectors';
import {setShowInfo} from '../_actions';

const block = cn('odin-monitor');

function Monitor() {
    const dispatch = useDispatch();
    const availability = useSelector(getMetricAvailability);
    const extendedInfo = useSelector(getExtendedInfo);
    const props = useSelector((state) => {
        const {loading, loaded, error, errorData} = state.odin;
        return {loading, loaded, error, errorData};
    });

    const handleShowInfo = useCallback((_, hours, minutes) => {
        dispatch(setShowInfo(hours, minutes));
    }, []);

    return (
        <LoadDataHandler {...props}>
            <AvailabilityMonitor data={availability} showInfo={handleShowInfo} />
            {extendedInfo && (
                <div className={block('item-info')}>
                    <ul className="elements-heading_size_s elements-list_inline_yes elements-list_type_unstyled">
                        <li>
                            Date: <span>{extendedInfo.date}</span>
                        </li>
                        <li>
                            State: <span>{extendedInfo.state}</span>
                        </li>
                    </ul>
                    <pre className="elements-code elements-code_theme_default">
                        {extendedInfo.message}
                    </pre>
                </div>
            )}
        </LoadDataHandler>
    );
}

export default Monitor;
