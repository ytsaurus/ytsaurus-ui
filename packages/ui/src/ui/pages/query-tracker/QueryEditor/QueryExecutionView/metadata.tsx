import React, {useMemo, useState} from 'react';
import type {NavigationMetaProps} from '@gravity-ui/querieskit';
import {Button} from '@gravity-ui/uikit';
import {ClipboardButton} from '@ytsaurus/components';

import type {QueryItem} from '../../../../types/query-tracker/api';
import hammer from '../../../../common/hammer';
import {Yson} from '../../../../components/Yson/Yson';
import SimpleModal from '../../../../components/Modal/SimpleModal';
import i18n from '../../QueryMetaTable/i18n';

export function useMetadata(query: QueryItem): {
    props: NavigationMetaProps;
    modal: React.ReactNode;
} {
    const [selected, setSelected] = useState<{value: unknown} | undefined>();
    const props = useMemo<NavigationMetaProps>(
        () => ({
            data: {
                groups: [
                    {
                        items: Object.entries(query)
                            .filter(
                                ([name]) => name !== 'query' && name !== 'access_control_object',
                            )
                            .map(([name, value]) => ({
                                name: hammer.format.Readable(name),
                                value:
                                    typeof value === 'object' && value !== null ? (
                                        <Button
                                            view="outlined"
                                            onClick={() => setSelected({value})}
                                        >
                                            {i18n('action_view-details')}
                                        </Button>
                                    ) : (
                                        <>
                                            {String(value ?? '')}
                                            {name === 'id' && (
                                                <ClipboardButton
                                                    size="s"
                                                    text={String(value)}
                                                    inlineMargins
                                                />
                                            )}
                                        </>
                                    ),
                            })),
                    },
                ],
            },
        }),
        [query],
    );
    return {
        props,
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
