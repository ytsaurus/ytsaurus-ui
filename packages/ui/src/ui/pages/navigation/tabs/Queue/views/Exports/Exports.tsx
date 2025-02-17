import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {getEditJsonYsonSettings} from '../../../../../../store/selectors/thor/unipika';
import {requestExportsConfig} from '../../../../../../store/actions/navigation/tabs/queue/exports';
import {
    getExportsConfig,
    getExportsConfigRequestInfo,
} from '../../../../../../store/selectors/navigation/tabs/queue/exports';
import {getPath} from '../../../../../../store/selectors/navigation';

import Yson from '../../../../../../components/Yson/Yson';
import {YsonDownloadButton} from '../../../../../../components/DownloadAttributesButton/YsonDownloadButton';

export function Exports() {
    const dispatch = useDispatch();

    const unipikaSettings = useSelector(getEditJsonYsonSettings);
    const config = useSelector(getExportsConfig);
    const {loading, loaded} = useSelector(getExportsConfigRequestInfo);
    const path = useSelector(getPath);

    useEffect(() => {
        dispatch(requestExportsConfig());
    }, [path]);

    return (
        <>
            {!loading && loaded && (
                <Yson
                    value={config}
                    folding
                    settings={unipikaSettings}
                    extraTools={<YsonDownloadButton value={config} settings={unipikaSettings} />}
                />
            )}
        </>
    );
}
