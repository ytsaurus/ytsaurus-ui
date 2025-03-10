import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import cn from 'bem-cn-lite';

import './NodeUnrecognizedOptions.scss';

const block = cn('node-unrecognized-options');

import {loadNodeUnrecognizedOptions} from '../../../../../store/actions/components/node/unrecognized-options';
import {
    getNodeUnrecognizedOptionsData,
    getNodeUnrecognizedOptionsError,
} from '../../../../../store/selectors/components/node/unrecognized-options';
import {YTErrorBlock} from '../../../../../components/Error/Error';
import Yson from '../../../../../components/Yson/Yson';
import {getNodeUnrecognizedOptionsYsonSettings} from '../../../../../store/selectors/thor/unipika';
import {YsonDownloadButton} from '../../../../../components/DownloadAttributesButton';

export function NodeUnrecognizedOptions({host}: {host: string}) {
    const dispatch = useDispatch();

    React.useEffect(() => {
        dispatch(loadNodeUnrecognizedOptions(host));
    }, [host, dispatch]);

    const data = useSelector(getNodeUnrecognizedOptionsData);
    const error = useSelector(getNodeUnrecognizedOptionsError);

    const unipikaSettings = useSelector(getNodeUnrecognizedOptionsYsonSettings);

    return error ? (
        <YTErrorBlock error={error} />
    ) : (
        <Yson
            className={block('yson')}
            value={data}
            settings={unipikaSettings}
            folding
            virtualized
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
