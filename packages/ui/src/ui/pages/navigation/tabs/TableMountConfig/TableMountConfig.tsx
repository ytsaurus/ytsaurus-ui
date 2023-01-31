import React from 'react';
import cn from 'bem-cn-lite';
import {useSelector} from 'react-redux';
import {getNavigationTableMountConfig} from '../../../../store/selectors/navigation/content/table-mount-config';
import ErrorBlock from '../../../../components/Error/Error';
import Yson from '../../../../components/Yson/Yson';
import {getNavigationMountConfigYsonSettings} from '../../../../store/selectors/thor/unipika';

const block = cn('table-mount-config');

function TableMountConfig() {
    const {data, error} = useSelector(getNavigationTableMountConfig);

    const settings = useSelector(getNavigationMountConfigYsonSettings);

    return (
        <div className={block('table-mount-config')}>
            {error ? (
                <ErrorBlock error={error} topMargin={'none'} />
            ) : (
                <Yson value={data} settings={settings} folding />
            )}
        </div>
    );
}

export default React.memo(TableMountConfig);
