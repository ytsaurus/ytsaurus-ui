import React, {useMemo, useState} from 'react';
import {Button} from '@gravity-ui/uikit';
import {ClipboardButton} from '@ytsaurus/components';

import {type QueryItem} from '../../../types/query-tracker/api';
import hammer from '../../../common/hammer';
import {Yson} from '../../../components/Yson/Yson';
import SimpleModal from '../../../components/Modal/SimpleModal';
import i18n from './i18n';

type QueryMetadataItem = {
    id: string;
    title: string;
    value: React.ReactNode;
};

export function useQueryMetadata(query: QueryItem) {
    const [selected, setSelected] = useState<{value: unknown} | undefined>();
    const items = useMemo<QueryMetadataItem[]>(
        () =>
            Object.entries(query)
                .filter(([name]) => name !== 'query' && name !== 'access_control_object')
                .map(([id, value]) => ({
                    id,
                    title: hammer.format.Readable(id),
                    value:
                        typeof value === 'object' && value !== null ? (
                            <Button view="outlined" onClick={() => setSelected({value})}>
                                {i18n('action_view-details')}
                            </Button>
                        ) : (
                            <>
                                {String(value ?? '')}
                                {id === 'id' && (
                                    <ClipboardButton size="s" text={String(value)} inlineMargins />
                                )}
                            </>
                        ),
                })),
        [query],
    );

    return {
        items,
        modal: (
            <SimpleModal
                visible={Boolean(selected)}
                disableBodyScrollLock
                onCancel={() => setSelected(undefined)}
            >
                {selected && <Yson value={selected.value} settings={{}} />}
            </SimpleModal>
        ),
    };
}
