import React, {FC, useState} from 'react';
import {Button} from '@gravity-ui/uikit';
import {AddQueryTokenForm} from './AddQueryTokenForm';
import i18n from './i18n';

export const AddQueryTokenFormButton: FC = () => {
    const [visible, setVisible] = useState(false);

    return (
        <>
            <Button view="outlined" onClick={() => setVisible(true)}>
                {i18n('action_add-query-token')}
            </Button>
            <AddQueryTokenForm visible={visible} onClose={() => setVisible(false)} />
        </>
    );
};
