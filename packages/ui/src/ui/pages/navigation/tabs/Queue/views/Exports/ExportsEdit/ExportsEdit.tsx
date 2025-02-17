import React from 'react';
import {Button} from '@gravity-ui/uikit';
import b from 'bem-cn-lite';

import Icon from '../../../../../../../components/Icon/Icon';
import {QueueExportConfig} from '../../../../../../../types/navigation/queue/queue';

import {ExportsEditDialog} from './ExportsEditDialog/ExportsEditDialog';

import './ExportsEdit.scss';

const block = b('exports-edit');

type ExportConfigUtility = {
    id: string;
    name: string;
};

export type ExportConfig = ExportConfigUtility & QueueExportConfig<{value: number}>;

export function ExportsEdit() {
    const [visible, setVisible] = React.useState(false);

    const toggleVisibility = React.useCallback(() => {
        setVisible(!visible);
    }, [visible, setVisible]);

    return (
        <>
            <div className={block()}>
                <Button className={block('button')} view="flat" onClick={toggleVisibility}>
                    <Icon awesome="pencil" />
                    Edit config
                </Button>
            </div>
            <ExportsEditDialog visible={visible} onClose={toggleVisibility} />
        </>
    );
}
