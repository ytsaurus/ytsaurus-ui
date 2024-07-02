import React from 'react';

import {Dialog} from '@gravity-ui/uikit';
import Stores from './Stores';

interface Props {
    visible: boolean;
    unorderedDynamicTable?: boolean;
    stores: Array<string>;
    index: number;

    onClose: () => void;
}

function StoresDialog(props: Props) {
    const {visible, unorderedDynamicTable, stores, index, onClose} = props;
    const title = unorderedDynamicTable
        ? '/stores'
        : index === -1
          ? '/eden/stores'
          : `partitions/${index}/stores`;

    return (
        <Dialog open={visible} onClose={onClose} hasCloseButton>
            <Dialog.Header caption={title} />
            <Dialog.Body>
                <Stores
                    storesId={stores}
                    index={index}
                    unorderedDynamicTable={unorderedDynamicTable}
                />
            </Dialog.Body>
        </Dialog>
    );
}

export default React.memo(StoresDialog);
