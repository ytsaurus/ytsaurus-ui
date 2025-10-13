import React from 'react';
import cn from 'bem-cn-lite';
import {useSelector} from '../../../../store/redux-hooks';
import {getNavigationTableMountConfig} from '../../../../store/selectors/navigation/content/table-mount-config';
import {YTErrorBlock} from '../../../../components/Error/Error';
import Yson from '../../../../components/Yson/Yson';
import {getNavigationMountConfigYsonSettings} from '../../../../store/selectors/thor/unipika';
import {YsonDownloadButton} from '../../../../components/DownloadAttributesButton';
import {UnipikaValue} from '../../../../components/Yson/StructuredYson/StructuredYsonTypes';
import {pathToFileName} from '../../helpers/pathToFileName';
import {getPath} from '../../../../store/selectors/navigation';

const block = cn('table-mount-config');

function TableMountConfig() {
    const {data, error} = useSelector(getNavigationTableMountConfig);
    const path = useSelector(getPath);

    const settings = useSelector(getNavigationMountConfigYsonSettings);

    return (
        <div className={block('table-mount-config')}>
            {error ? (
                <YTErrorBlock error={error} topMargin={'none'} />
            ) : (
                <Yson
                    value={data}
                    settings={settings}
                    folding
                    extraTools={
                        <YsonDownloadButton
                            value={data as UnipikaValue}
                            settings={settings}
                            name={`mount_config_${pathToFileName(path)}`}
                        />
                    }
                />
            )}
        </div>
    );
}

export default React.memo(TableMountConfig);
