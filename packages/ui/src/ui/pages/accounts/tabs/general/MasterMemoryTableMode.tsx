import React from 'react';

import map_ from 'lodash/map';

import {
    selectAccountMasterMemoryMedia,
    selectAccountsContentMode,
    selectAccountsMasterMemoryContentMode,
} from '../../../../store/selectors/accounts/accounts-ts';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {
    type AccountsStateDataFields,
    setAccountsStateDataFields,
} from '../../../../store/actions/accounts/accounts-ts';
import {Secondary} from '@ytsaurus/components';
import format from '../../../../common/hammer/format';
import Select from '../../../../components/Select/Select';
import i18n from './i18n';

function Item({text}: {text: string}) {
    return (
        <React.Fragment>
            <Secondary>{i18n('field_mode')}</Secondary> {text}
        </React.Fragment>
    );
}

function MasterMemoryTableMode() {
    const dispatch = useDispatch();
    const mode = useSelector(selectAccountsContentMode);
    const value = useSelector(selectAccountsMasterMemoryContentMode);
    const media = useSelector(selectAccountMasterMemoryMedia);

    const handleUpdate = React.useCallback(
        (vals: Array<string>) => {
            dispatch(
                setAccountsStateDataFields({
                    masterMemoryContentMode:
                        vals[0] as AccountsStateDataFields['masterMemoryContentMode'],
                }),
            );
        },
        [dispatch],
    );

    const items = React.useMemo(() => {
        return map_(media, (item) => {
            return {
                value: item,
                text: <Item text={format.Readable(item)} />,
            };
        });
    }, [media]);

    return mode !== 'master_memory' ? null : (
        <span>
            <Select onUpdate={handleUpdate} items={items} value={[value]} filterable />
        </span>
    );
}

export default React.memo(MasterMemoryTableMode);
