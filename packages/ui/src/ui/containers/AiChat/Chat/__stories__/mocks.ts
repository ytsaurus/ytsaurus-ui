import {HttpResponse, http} from 'msw';

// The Markdown component renders through the UI server, not in the browser.
export const chatMarkdownHandler = http.post('*/api/markdown-to-html', async ({request}) => {
    const {text} = (await request.json()) as {text: string};
    const html =
        text === '## Query\n\nThis query returns a number.\n\n```sql\nSELECT 1;\n```'
            ? '<h2>Query</h2><p>This query returns a number.</p><pre><code>SELECT 1;</code></pre>'
            : `<p>${text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`;
    return HttpResponse.json({result: {html}});
});

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

const savedConversation = {
    id: 'conv_saved',
    created_at: 1700000000,
    metadata: {topic: 'Saved conversation'},
};
export const chatHistoryHandlers = [
    http.get('*/api/code-assistant/models', () =>
        HttpResponse.json({data: [{id: 'model-a'}, {id: 'model-b'}]}),
    ),
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
