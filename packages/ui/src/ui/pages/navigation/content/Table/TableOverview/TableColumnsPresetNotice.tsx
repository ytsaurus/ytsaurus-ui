import React from 'react';
import {useSelector} from '../../../../../store/redux-hooks';
import cn from 'bem-cn-lite';

import map_ from 'lodash/map';

import {
    getColumnsPresetColumns,
    getColumnsPresetError,
    getColumnsPresetHash,
} from '../../../../../store/selectors/navigation/content/table-ts';
import {Warning} from '../../../../../components/Text/Text';
import Yson from '../../../../../components/Yson/Yson';
import {YTErrorBlock} from '../../../../../components/Error/Error';
import CollapsibleSection from '../../../../../components/CollapsibleSection/CollapsibleSection';

import './TableColumnsPresetNotice.scss';

const block = cn('table-columns-preset-notice');

function TableColumnsPresetNotice() {
    const hash = useSelector(getColumnsPresetHash);
    const columns = useSelector(getColumnsPresetColumns);
    const error: any = useSelector(getColumnsPresetError);

    if (!hash) {
        return null;
    }

    if (error) {
        return (
            <YTErrorBlock
                error={error.response?.data || error}
                message={'Cannot load preset of columns'}
            />
        );
    }

    console.log(columns);

    return (
        <Warning className={block()}>
            <CollapsibleSection
                name={'The table is opened with preset of columns'}
                size={'unset'}
                collapsed
            >
                {!columns?.length ? null : (
                    <span>
                        {map_(columns, (item, index) => {
                            return (
                                <React.Fragment key={index}>
                                    <Yson key={index} value={item} className={block('column')} />
                                    {index !== columns.length - 1 && ', '}
                                </React.Fragment>
                            );
                        })}
                    </span>
                )}
            </CollapsibleSection>
        </Warning>
    );
}

export default React.memo(TableColumnsPresetNotice);
