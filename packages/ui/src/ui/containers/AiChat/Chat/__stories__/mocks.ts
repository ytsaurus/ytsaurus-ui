import {HttpResponse, http} from 'msw';

export const chatResponseHandler = http.post('*/api/code-assistant/send-message', () => {
    const output = [
        {
            id: 'answer',
            type: 'message',
            role: 'assistant',
            status: 'completed',
            content: [{type: 'output_text', text: 'A streamed answer', annotations: []}],
        },
    ];
    const events = [
        {type: 'response.output_text.delta', delta: 'A streamed answer'},
        {type: 'response.output_item.done', item: output[0]},
        {type: 'response.completed', response: {output}},
    ];
    return new HttpResponse(
        events.map((event) => `data: ${JSON.stringify(event)}\n\n`).join('') + 'data: [DONE]\n\n',
        {headers: {'Content-Type': 'text/event-stream'}},
    );
});

export const savedConversation = {
    id: 'conv_saved',
    created_at: 1700000000,
    metadata: {topic: 'Saved conversation'},
};
export const chatHistoryHandlers = [
    http.post('*/api/code-assistant/create-conversation', () =>
        HttpResponse.json({
            id: 'conv_new',
            created_at: 1700000001,
            metadata: {topic: 'New conversation'},
        }),
    ),
    http.get('*/api/code-assistant/conversations', () =>
        HttpResponse.json({
            data: [savedConversation],
            has_more: false,
            last_id: savedConversation.id,
        }),
    ),
    http.get('*/api/code-assistant/conversations/:id/items', () =>
        HttpResponse.json({
            data: [
                {
                    id: 'saved-answer',
                    type: 'message',
                    role: 'assistant',
                    content: [{type: 'output_text', text: 'Saved answer'}],
                },
                {
                    id: 'saved-question',
                    type: 'message',
                    role: 'user',
                    content: [{type: 'input_text', text: 'Saved question'}],
                },
            ],
            has_more: false,
        }),
    ),
    http.delete('*/api/code-assistant/conversations/:id', ({params}) =>
        HttpResponse.json({id: params.id, deleted: true}),
    ),
];
