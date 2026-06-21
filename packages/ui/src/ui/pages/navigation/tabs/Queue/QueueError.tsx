import React from 'react';
import {useSelector} from '../../../../store/redux-hooks';
import moment from 'moment';

import {YTErrorBlock, type YTErrorBlockProps} from '../../../../containers/Block/Block';
import {Info} from '../../../../components/Info/Info';
import {getErrorWithCode} from '../../../../utils/errors';
import {type YTError} from '../../../../types';

import {selectNavigationPathAttributes} from '../../../../store/selectors/navigation/navigation';
import i18n from './i18n';

// https://github.com/ytsaurus/ytsaurus/blob/95acd2c25e8996eccada40d178bfef6784fb3278/yt/yt/client/queue_client/public.h#L18
const QUEUE_IS_NOT_MAPPED = 3105;
const MAPPING_TIMEOUT = 5 * 60 * 1000;

export function QueueError({error, ...rest}: Omit<YTErrorBlockProps, 'error'> & {error: YTError}) {
    const {modification_time} = useSelector(selectNavigationPathAttributes);

    const isMappingError = React.useMemo(() => {
        const modificationTime = moment(modification_time).valueOf();
        if (Math.abs(Date.now() - modificationTime) > MAPPING_TIMEOUT) {
            return false;
        }
        return getErrorWithCode([error], QUEUE_IS_NOT_MAPPED);
    }, [error, modification_time]);

    if (isMappingError) {
        return <Info>{i18n('alert_mapping-in-progress')}</Info>;
    }

    return <YTErrorBlock error={error} {...rest} />;
}
