import React from 'react';
import {Button, ClipboardButton, Flex, Icon} from '@gravity-ui/uikit';

import type {QueryItem} from '../../../../../types/query-tracker/api';
import {useDispatch} from '../../../../../store/redux-hooks';
import {abortCurrentQuery} from '../../../../../store/actions/query-tracker/query';
import UIFactory from '../../../../../UIFactory';
import stopIcon from '../../../../../assets/img/svg/icons/stop-circle.svg';
import {ShareButton} from '../../../QueryResults/ShareButton';
import {EditQueryACOModal} from '../../../QueryACO/EditQueryACOModal/EditQueryACOModal';
import {isAbortable} from '../../../utils/query';
import metaI18n from '../../../QueryResults/QueryMetaRow/i18n';
import i18n from '../i18n';

type Props = {
    query: QueryItem;
    showErrorActions: boolean;
};

export function QueryExecutionActions({query, showErrorActions}: Props) {
    const dispatch = useDispatch();
    const AskAiButton = UIFactory.getAiChat().AskAiButton;

    return (
        <Flex alignItems="center" gap={2} wrap>
            <ShareButton />
            <EditQueryACOModal query_id={query.id} />
            {isAbortable(query) && (
                <Button size="s" onClick={() => dispatch(abortCurrentQuery())}>
                    <Icon data={stopIcon} />
                    {metaI18n('action_stop')}
                </Button>
            )}
            {showErrorActions && Boolean(query.error) && (
                <>
                    <ClipboardButton
                        text={JSON.stringify(query.error, null, 4)}
                        tooltipInitialText={i18n('action_copy-error')}
                    />
                    {AskAiButton && <AskAiButton type="query-error-tree" />}
                </>
            )}
        </Flex>
    );
}
