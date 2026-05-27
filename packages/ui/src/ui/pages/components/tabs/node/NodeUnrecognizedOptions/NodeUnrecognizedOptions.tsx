import React from 'react';
import {useDispatch, useSelector} from '../../../../../store/redux-hooks';
import cn from 'bem-cn-lite';

import './NodeUnrecognizedOptions.scss';

const block = cn('node-unrecognized-options');

import {loadNodeUnrecognizedOptions} from '../../../../../store/actions/components/node/unrecognized-options';
import {
    selectNodeUnrecognizedOptionsData,
    selectNodeUnrecognizedOptionsError,
} from '../../../../../store/selectors/components/node/unrecognized-options';
import {YTErrorBlock} from '../../../../../containers/Block/Block';
import {YsonWithScroll} from '../../../../../components/Yson/YsonWithScroll';
import {getNodeUnrecognizedOptionsYsonSettings} from '../../../../../store/selectors/thor/unipika';
import {YsonDownloadButton} from '../../../../../components/DownloadAttributesButton';

export function NodeUnrecognizedOptions({host}: {host: string}) {
    const dispatch = useDispatch();

    React.useEffect(() => {
        dispatch(loadNodeUnrecognizedOptions(host));
    }, [host, dispatch]);

    const data = useSelector(selectNodeUnrecognizedOptionsData);
    const error = useSelector(selectNodeUnrecognizedOptionsError);

    const unipikaSettings = useSelector(getNodeUnrecognizedOptionsYsonSettings);

    return error ? (
        <YTErrorBlock error={error} />
    ) : (
        <YsonWithScroll
            className={block('yson')}
            value={data}
            settings={unipikaSettings}
            extraTools={
                <YsonDownloadButton
                    value={data}
                    settings={unipikaSettings}
                    name={`unrecognized_options_${host}`}
                />
            }
        />
    );
}
