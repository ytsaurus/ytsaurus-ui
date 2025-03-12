import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Flex, Loader} from '@gravity-ui/uikit';
import b from 'bem-cn-lite';

import {getEditJsonYsonSettings} from '../../../../../../store/selectors/thor/unipika';
import {requestExportsConfig} from '../../../../../../store/actions/navigation/tabs/queue/exports';
import {
    getExportsConfig,
    getExportsConfigRequestInfo,
} from '../../../../../../store/selectors/navigation/tabs/queue';
import {getPath} from '../../../../../../store/selectors/navigation';

import Yson from '../../../../../../components/Yson/Yson';
import {YsonDownloadButton} from '../../../../../../components/DownloadAttributesButton/YsonDownloadButton';
import {ExportsEdit} from './ExportsEdit/ExportsEdit';

import './Exports.scss';

const block = b('exports');

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
        <Flex justifyContent={'center'} className={block()}>
            {!loading && loaded ? (
                <Yson
                    value={config}
                    folding
                    settings={unipikaSettings}
                    extraTools={<ExportsExtraTools config={config} settings={unipikaSettings} />}
                    className={block('configs')}
                />
            ) : (
                <Loader />
            )}
        </Flex>
    );
}

function ExportsExtraTools({config, settings}: any) {
    return (
        <Flex direction={'row'} gap={2}>
            <YsonDownloadButton value={config} settings={settings} />
            <ExportsEdit />
        </Flex>
    );
}
