import React, {useState} from 'react';
import b from 'bem-cn-lite';
import {useDispatch, useSelector} from '../../../../../store/redux-hooks';
import {Alert, Button} from '@gravity-ui/uikit';
import ypath from '../../../../../common/thor/ypath';

import {remountTable} from '../../../../../store/actions/navigation/content/table/remount-table';
import {selectAttributesWithTypes} from '../../../../../store/selectors/navigation';

import i18n from './i18n';

import './RemountAlert.scss';

const block = b('remount-alert');

export function RemountAlert() {
    const dispatch = useDispatch();
    const attributesWithTypes = useSelector(selectAttributesWithTypes);
    const [pending, setPending] = useState(false);

    const handleOnRemount = async () => {
        setPending(true);
        await dispatch(remountTable());
        setPending(false);
    };

    const [remountNeededTabletCount, tabletCount] = ypath.getValues(attributesWithTypes, [
        '/remount_needed_tablet_count',
        '/tablet_count',
    ]);

    const showDiffInfo = remountNeededTabletCount !== tabletCount;

    const message = showDiffInfo
        ? i18n('alert_remount-needed-with-diff', {remountNeededTabletCount, tabletCount})
        : i18n('alert_remount-needed');

    return (
        <Alert
            theme="warning"
            layout="horizontal"
            title={i18n('title_settings-not-applied')}
            message={message}
            className={block()}
            actions={
                <Button
                    onClick={handleOnRemount}
                    disabled={pending}
                    className={block('button')}
                    view="normal-contrast"
                    size="s"
                >
                    {i18n('action_remount')}
                </Button>
            }
        ></Alert>
    );
}
