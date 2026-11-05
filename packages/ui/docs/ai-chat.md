# AI chat

## Configuration

Add `aiChatConfig` to `uiSettings` in your installation's
[server configuration](configuration.md#configuration), then restart the UI server:

```json
{
  "uiSettings": {
    "aiChatConfig": {
      "baseUrl": "https://your-llm.example/",
      "defaultModel": "your-model"
    }
  }
}
```

`baseUrl` is the complete API root.
`defaultModel` is used for replies unless the user selects another model, and for
conversation titles. Optional settings are described in
[`AIChatConfig`](../src/shared/ai-chat.ts).

## Backend requirements

The backend must support model listing (`GET /models`), streaming and non-streaming
Responses, and Conversations APIs with persistent history and metadata updates.

## Conversation listing contract

`GET /conversations?limit=20&after=...` is a backend extension, not a standard
OpenAI Conversations endpoint. The first request omits `after`. Return
[`ConversationPage<Conversation>`](../src/shared/ai-chat.ts):

```json
{
  "data": [
    {
      "id": "conv_123",
      "created_at": 1735689600,
      "metadata": {"topic": "Query optimization"}
    }
  ],
  "has_more": false,
  "last_id": "conv_123"
}
```

- `created_at` is a Unix timestamp in **seconds**; optional `metadata.topic` is the chat title.
- When `has_more` is `true`, return a non-empty `last_id`; the next request passes it as `after`.
- For an empty list, return `{"data": [], "has_more": false, "last_id": null}`.

The items endpoint uses standard Conversations API items and the same `data`,
`has_more`, and `last_id` pagination fields.

## Authentication

Configure backend authentication through
`serverFactory.getAuthHeaders('aiChat', req)`; by default it returns no headers.

The backend must identify the authenticated user, scope conversation lists to that
user, and enforce ownership on reads, replies, title updates, and deletion.
The UI server does not maintain a separate ownership registry.
