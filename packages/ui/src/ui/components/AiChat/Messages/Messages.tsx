import React, {FC} from 'react';
import {Message} from '../Message';
import {useDispatch, useSelector} from '../../../store/redux-hooks';
import {selectConversation} from '../../../store/selectors/ai/chat';
import {loadMoreConversationItems} from '../../../store/actions/ai/chat';
import {Button, Flex, Icon, Loader} from '@gravity-ui/uikit';
import ChevronUpIcon from '@gravity-ui/icons/svgs/chevron-up.svg';
import i18n from './i18n';

export const Messages: FC = () => {
    const dispatch = useDispatch();
    const {items, hasMore, loading} = useSelector(selectConversation);

    const handleLoadMore = () => {
        dispatch(loadMoreConversationItems());
    };

    return (
        <>
            {hasMore && (
                <Flex justifyContent="center" alignItems="center" direction="column">
                    {loading ? (
                        <Loader size="s" />
                    ) : (
                        <Button view="outlined" onClick={handleLoadMore} disabled={loading}>
                            <Icon data={ChevronUpIcon} size={16} />
                            {i18n('action_load-older')}
                        </Button>
                    )}
                </Flex>
            )}
            {items.map((message) => {
                const key = 'id' in message ? message.id : message.error.message;
                return <Message key={key} message={message} />;
            })}
        </>
    );
};

Messages.displayName = 'Messages';
