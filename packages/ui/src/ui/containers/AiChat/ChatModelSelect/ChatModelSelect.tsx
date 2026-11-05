import React, {useEffect} from 'react';
import {Button, Flex, Select, Text} from '@gravity-ui/uikit';
import {useDispatch, useSelector} from '../../../store/redux-hooks';
import {getModels} from '../../../store/actions/ai/chat';
import {setSelectedModel} from '../../../store/reducers/ai/chatSlice';
import {
    selectChatModel,
    selectChatModelOptions,
    selectChatModels,
    selectChatSending,
} from '../../../store/selectors/ai/chat';
import i18n from '../i18n';

export function ChatModelSelect() {
    const dispatch = useDispatch();
    const model = useSelector(selectChatModel);
    const options = useSelector(selectChatModelOptions);
    const {loading, error} = useSelector(selectChatModels);
    const sending = useSelector(selectChatSending);

    useEffect(() => {
        dispatch(getModels());
    }, [dispatch]);

    return (
        <Flex direction="column" gap={1}>
            <Select
                aria-label={i18n('field_model')}
                value={model ? [model] : []}
                options={options}
                onUpdate={([value]) => {
                    if (value) dispatch(setSelectedModel(value));
                }}
                disabled={sending}
                loading={loading}
                width="max"
                qa="ai-chat-model"
            />
            {error && (
                <Flex gap={1} alignItems="center" wrap="wrap">
                    <Text color="danger" role="alert">
                        {i18n('alert_models-load-failed')}
                    </Text>
                    <Button
                        size="s"
                        disabled={sending || loading}
                        onClick={() => dispatch(getModels(true))}
                    >
                        {i18n('action_retry-models')}
                    </Button>
                </Flex>
            )}
        </Flex>
    );
}
