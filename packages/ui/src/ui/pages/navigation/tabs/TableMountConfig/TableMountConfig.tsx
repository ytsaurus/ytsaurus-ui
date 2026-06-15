import React from 'react';
import cn from 'bem-cn-lite';
import {useSelector} from '../../../../store/redux-hooks';
import {selectNavigationTableMountConfig} from '../../../../store/selectors/navigation/content/table-mount-config';
import {YTErrorBlock} from '../../../../containers/Block/Block';
import {YsonWithScroll} from '../../../../components/Yson/YsonWithScroll';
import {selectNavigationMountConfigYsonSettings} from '../../../../store/selectors/thor/unipika';
import {YsonDownloadButton} from '../../../../components/DownloadAttributesButton';
import {type UnipikaValue} from '../../../../components/Yson/StructuredYson/StructuredYsonTypes';
import {pathToFileName} from '../../helpers/pathToFileName';
import {selectPath} from '../../../../store/selectors/navigation';

const block = cn('table-mount-config');

function TableMountConfig() {
    const {data, error} = useSelector(selectNavigationTableMountConfig);
    const path = useSelector(selectPath);

    const settings = useSelector(selectNavigationMountConfigYsonSettings);

    return (
        <div className={block('table-mount-config')}>
            {error ? (
                <YTErrorBlock error={error} topMargin={'none'} />
            ) : (
                <YsonWithScroll
                    value={data}
                    settings={settings}
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
