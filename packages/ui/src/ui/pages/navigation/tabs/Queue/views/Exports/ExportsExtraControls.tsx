import React, {useCallback, useState} from 'react';
import {Button, Flex} from '@gravity-ui/uikit';
import {ExportsEditDialog} from './ExportsEditDialog/ExportsEditDialog';

export function ExportsExtraControls() {
    const [visible, setVisible] = useState(false);

    const toggleVisibility = useCallback(() => {
        setVisible(!visible);
    }, [visible, setVisible]);

    return (
        <Flex direction={'row'} gap={3}>
            <div style={{borderLeft: '1px solid var(--dark-divider)'}}></div>
            <Button view={'outlined'} onClick={toggleVisibility} qa={'create-export'}>
                Create export
            </Button>
            <ExportsEditDialog type={'create'} visible={visible} onClose={toggleVisibility} />
        </Flex>
    );
}
