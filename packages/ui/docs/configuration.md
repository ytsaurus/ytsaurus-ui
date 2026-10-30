## Configuration

By default the application uses base configuration from `path_to_dist/server/configs/common.js` file. And it might be expanded by additional files throgh special variables:

- `APP_ENV` - if defined then tries to expand base config from `path_to_dist/server/config/{APP_ENV}.js`
- `APP_INSTALLATION` - if defined then tries to expand base config from:
  - `path_to_dist/server/config/{APP_INSTALLATION}/common.js`
  - `path_to_dist/server/config/{APP_INSTALLATION}/{APP_ENV}.js` (if APP_ENV is defined)

There are different options that allow to change behavior of the application.

Example of usage for 'custom' installation:

1. Set environment variable APP_INSTALLATION=cusom
2. Create path_to_dist/server/config/custom/common.js with some redefinitions:

```js
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
  someOption1: someValue;
  ...
}
```

### Authentication & Authorization

#### `authCookieDomain`

The `authCookieDomain` option is required for uploading files and tables. Example: `authCookieDomain=".ytsaurus.my.domain"`.
Make sure `ClusterConfig.externalProxy` value is a subdomain for the value.

#### Password

To enable password authentication/authorization you have to set `YTCoreConfig.allowPasswordAuth = true`.

#### OAuth

To use oauth authentication, it is necessary to define configurations `ytOAuthSettings`.

`ytOAuthSettings` - OAuth config

An example of configuration:

```js
ytOAuthSettings: {
    baseURL: 'http://keycloak.some-domain.com',
    authPath: 'realms/test-realm/protocol/openid-connect/auth',
    tokenPath: 'realms/test-realm/protocol/openid-connect/token',
    logoutPath: 'realms/test-realm/protocol/openid-connect/logout',
    clientId: 'test-client',
    clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
    scope: 'openid profile',
    buttonLabel: 'Login via Keycloak', // OPTIONAL. By default equal `Login via SSO`
}
```

### UISettings

`uiSettings` object from config is passed to user's browser "as is" and might it be accessed as `window.__DATA__.uiSettings`.

#### `uiSettings.schedulingDenyRootAsParent`

The opetion denies to create pool with `<Root>` parent from the UI

#### `uiSettings.reShortNameFromAddress`

The option allows to define regular expression with named groups `shortname` and `suffix` to extract short name from address of node. `suffix`-group is optional, but if it is preset it will be concatenated with shortname.

#### `uiSettings.reShortNameFromTabletNodeAddress`

The option is similar to `reShortNameFromAddress` but it is applied only to bundles/tablets/cells specific parts of UI, the option do not affects `Components/Nodes`.

##### `uiSettings.schedulingMonitoring`

```ts
{
  schedulingMonitoring: {urlTemplate: string; title?: string}
}
```

`schedulingMonitoring.urlTemplate` allows to define parametrized template of url for external monitoring dashbord of a pool.
If defined then `${title} ?? 'Monitoring'` tab will be present as a link generated from the template.
The template supports following parameters: `{ytCluster}`, `{ytPool}`, `{ytPoolTree}`, all the parameters will be replaced with corresponiding values.
Example of usage:

```js
{
  uiSettings: {
    schedulingMonitoring: {
      urlTemplate:
        'https://my.monitoring.service/scheduling?cluster={ytCluster}&pool={ytPool}&tree={ytPoolTree}',
      title: 'My monitoring',
    },
  },
};
```

##### `uiSettings.accountsMonitoring`

```ts
{
  accountsMonitoring: {urlTemplate: string; title?: string}
}
```

`accountsMonitoring.urlTemplate` allows to define parametrized template of url for external monitoring dashbord of an account.
If defined then `${title} ?? 'Monitoring'` tab will be present as a link generated from the template.
The template supports following parameters: `{ytCluster}`, `{ytAccount}`. All the parameters are optional and will be replaced with corresponiding values.
Example of usage:

```js
{
  uiSettings: {
    accountsMonitoring: {
      urlTemplate: 'https://my.monitoring.service/accounts?cluster={ytCluster}&account={ytAccount}',
      title: 'My monitoring',
    },
  },
};
```

##### `uiSettings.bundlesMonitoring`

```ts
{
  bundlesMonitoring: {urlTemplate: string; title?: string}
}
```

`bundlesMonitoring.urlTemplate` allows to define parametrized template of url for external monitoring dashbord of a tablet cell bundle.
If defined then `${title} ?? 'Monitoring'` tab will be present as a link generated from the template on a page of a pool.
The template supports following parameters: `{ytCluster}`, `{ytTabletCellBundle}`. All the parameters are optional and will be replaced with corresponiding values.
Example of usage:

```js
{
  uiSettings: {
    bundlesMonitoring: {
      urlTemplate: 'https://my.monitoring.service/bundles?cluster={ytCluster}&bundle={ytTabletCellBundle}',
      title: 'My monitoring',
    },
  },
};
```

##### `uiSettings.operationsMonitoring`

```ts
{
  operationsMonitoring: {
    urlTemplate: string;
  }
}
```

`operationsMonitoring.urlTemplate` allows to define parametrized template of url for external monitoring dashbord of an operation.
If defined then `'Monitoring'` tab will be present for current operation and the contend will be defined as a list
of generated urls from the templates for each pair of pool and pool-tree involved to the operation.
The template support following parameters:

- `{ytCluster}`
- `{ytOperationId}`
- `{ytPool}`
- `{ytPoolTree}`
- `{ytSlotIndex}`
- `{fromTimeMs}`
- `{toTimeMs}`

all the parameters are oprional and will be replaced with corresponiding values.
Example of usage:

```js
{
  uiSettings: {
    operationsMonitoring: {
      urlTemplate:
        'https://my.monitoring.service/operations?cluster={ytCluster}&ytOperationId={ytOperationId}&pool={ytPool}&poolTree={ytPoolTree}&from={fromTimeMs}&to={toTimeMs}',
    },
  },
};
```

## AI chat

### Backend requirements

The UI server connects to a backend that implements OpenAI Responses and Conversations
APIs, plus a conversation listing endpoint. Streaming Responses support alone is not enough.
The backend must retain conversation items between requests.

Paths below are relative to `baseUrl`:

| Method and path                 | Used for                                                                                              |
| ------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `POST /responses`               | Streaming chat replies and non-streaming title generation                                             |
| `POST /conversations`           | Creating a conversation with metadata                                                                 |
| `GET /conversations`            | Listing saved conversations; backend extension described below                                        |
| `GET /conversations/{id}/items` | Loading messages, with `order=desc&limit=50` for history and `order=asc&limit=5` for title generation |
| `GET /conversations/{id}`       | Reading metadata before updating a title; optional with `conversationLookup: "list"`                  |
| `POST /conversations/{id}`      | Updating metadata to save the title in `topic`                                                        |
| `DELETE /conversations/{id}`    | Deleting a saved conversation                                                                         |

### Configuration

Add `aiChatConfig` to `uiSettings` in your installation's server configuration
(see [Configuration](#configuration)), then restart the UI server:

```json
{
  "uiSettings": {
    "aiChatConfig": {
      "baseUrl": "https://your-llm.example/v1",
      "model": "your-model"
    }
  }
}
```

| Option               | Description                                                                                                                                                                              |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `baseUrl`            | Required. Complete API root: `https://your-llm.example/v1` produces `https://your-llm.example/v1/responses`. `/v1` is not added automatically.                                           |
| `model`              | Required. Model used for replies and title generation.                                                                                                                                   |
| `metadata`           | Optional string-to-string map sent with reply and title generation requests. Page-specific metadata overrides matching keys.                                                             |
| `conversationLookup` | Optional: `"retrieve"` (default) reads a conversation by ID before updating its title. Use `"list"` if the backend only supports listing; the server searches the list for its metadata. |

`uiSettings` is exposed to the browser. Keep credentials in server-side configuration
or secret storage, not in `aiChatConfig` or its `metadata`.

### Authentication

All backend requests use `serverFactory.getAuthHeaders('aiChat', req)`. Its default
implementation reads `req.yt.aiChatAuthHeaders`, which your authentication middleware
can populate. No default `Authorization` header is sent.

For a custom installation, you can instead register an override in
[`src/server/index.ts`](../../custom-ytsaurus-ui.example/src/server/index.ts), before
creating `ExpressKit`. This example assumes that the backend accepts a service token
and a trusted user login in `X-User-Id`, and that application authentication populates
`req.yt.login`:

```ts
import serverFactory, {configureServerFactory} from '../ytsaurus-ui.server/ServerFactory';

const defaultGetAuthHeaders = serverFactory.getAuthHeaders;
configureServerFactory({
  getAuthHeaders(type, req) {
    if (type !== 'aiChat') return defaultGetAuthHeaders(type, req);
    const token = process.env.AI_CHAT_API_TOKEN;
    const login = req.yt?.login;
    if (!token || !login) throw new Error('AI chat credentials or user identity missing');
    return {Authorization: `Bearer ${token}`, 'X-User-Id': login};
  },
});
```

`AI_CHAT_API_TOKEN` is an environment variable introduced by this example, not a
built-in UI setting. Adapt the headers to your backend's authentication contract.
The backend must validate the credentials and trusted identity, scope conversation
listing to that user, and check ownership on reads, replies, title updates and deletion.
The UI server does not maintain a separate ownership registry.

### Conversation listing contract

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

### Verify the integration

1. Open Query Tracker on a configured cluster and click **Ask AI**. The chat panel
   is unavailable in local mode.
2. Send a message. Check that the reply streams and the conversation receives a title.
3. Close and reopen the panel, then start a new chat. Open history and select the
   previous conversation: its messages should still be available.
4. Delete that conversation and reopen history to confirm that it is gone.

If replies work but titles fail, check non-streaming `POST /responses`, ascending
item retrieval, conversation lookup and metadata updates from the requirements above.
