import React, {useState} from 'react';
import b from 'bem-cn-lite';
import {useDispatch, useSelector} from 'react-redux';
import {Alert, Button} from '@gravity-ui/uikit';
import ypath from '../../../../../common/thor/ypath';

import {remountTable} from '../../../../../store/actions/navigation/content/table/remount-table';
import {getAttributesWithTypes} from '../../../../../store/selectors/navigation';

import './RemountAlert.scss';

const block = b('remount-alert');

export function RemountAlert() {
    const dispatch = useDispatch();
    const attributesWithTypes = useSelector(getAttributesWithTypes);
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
    const diffInfo = ` (${remountNeededTabletCount} of ${tabletCount} tablets pending)`;

    const message = `Table should be remounted to apply new settings${showDiffInfo ? diffInfo : ''}. 
                 This action will not cause any downtime. See Mount config tab for details.`;

    return (
        <Alert
            theme="warning"
            layout="horizontal"
            title="Some table settings are not applied to tablets"
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
                    Remount
                </Button>
            }
        ></Alert>
    );
}
