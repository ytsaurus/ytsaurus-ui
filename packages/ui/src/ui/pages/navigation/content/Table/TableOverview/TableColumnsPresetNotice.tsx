import React from 'react';
import {useSelector} from '../../../../../store/redux-hooks';
import cn from 'bem-cn-lite';

import map_ from 'lodash/map';

import {
    selectColumnsPresetColumns,
    selectColumnsPresetError,
    selectColumnsPresetHash,
} from '../../../../../store/selectors/navigation/content/table-ts';
import {Warning} from '@ytsaurus/components';
import {Yson} from '../../../../../components/Yson/Yson';
import {YTErrorBlock} from '../../../../../containers/Block/Block';
import CollapsibleSection from '../../../../../components/CollapsibleSection/CollapsibleSection';

import i18n from './i18n';
import './TableColumnsPresetNotice.scss';

const block = cn('table-columns-preset-notice');

function TableColumnsPresetNotice() {
    const hash = useSelector(selectColumnsPresetHash);
    const columns = useSelector(selectColumnsPresetColumns);
    const error: any = useSelector(selectColumnsPresetError);

    if (!hash) {
        return null;
    }

    if (error) {
        return (
            <YTErrorBlock
                error={error.response?.data || error}
                message={i18n('alert_cannot-load-preset')}
            />
        );
    }

    return (
        <Warning className={block()}>
            <CollapsibleSection name={i18n('title_preset-of-columns')} size={'unset'} collapsed>
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
