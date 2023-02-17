[![npm version](https://badger.yandex-team.ru/npm/@yandex-data-ui/yt-javascript-wrapper/version.svg)](https://npm.yandex-team.ru/@yandex-data-ui/yt-javascript-wrapper)
[![oko health](https://oko.yandex-team.ru/badges/repo.svg?repoName=data-ui/yt-javascript-wrapper&vcs=arc)](https://oko.yandex-team.ru/repo/data-ui/yt-javascript-wrapper)
[![oko health](https://oko.yandex-team.ru/badges/repoSecurity.svg?repoName=data-ui/yt-javascript-wrapper&vcs=arc)](https://oko.yandex-team.ru/repo/data-ui/yt-javascript-wrapper)

## YT JavaScript Wrapper (Browser + Node.js)

The library helps to make requests to YTsaurus clusters over HTTP API YT.

### Installation

`npm install @yandex-data-ui/yt-javascript-wrapper`

### Usage

```javascript
const yt = require("@yandex-data-ui/yt-javascript-wrapper")();

// Позволяет задать настройки по умолчанию для всех команд.
// Если же необходимо работать с несколькими кластерами одновременно, то прокси и токен передаются каждой команде отдельно.
yt.setup.setGlobalOption("proxy", "plato.yt.yandex-team.ru");
yt.setup.setGlobalOption("secure", true);

yt.setup.setGlobalOption("authentication", {
  type: "domain",
});

yt.setup.setGlobalOption("timeout", 15000);

// Пример 1
yt.v3.get({ path: "//sys/users/yozhik/@" });

yt.v3
  .get({
    setup: {
      proxy: "hahn.yt.yandex.net",
      authentication: {
        type: "none",
      },
    },
    parameters: { path: "//sys/users/yozhik/@" },
  })
  .done(function (userAttributes) {
    // ...
  });

// Пример 2
yt.v3.set({ path: "//sys/users/yozhik/@banned" }, true);

yt.v3
  .set({
    setup: {
      proxy: "banach.yt.yandex.net",
      authentication: {
        type: "oauth",
        token: "abcdefghijklmnopqrstuvwxyz",
      },
    },
    parameters: { path: "//sys/users/yozhik/@banned" },
    data: true,
  })
  .done(function () {
    // ...
  });
```

### Configuration

The library allows to set global and local settings for each request.

| _Option_                    | _type_  | _Default value_    |
| --------------------------- | ------- | ------------------ |
| `secure`                    | boolean | `true`             |
| `useHeavyProxy`             | boolean | -                  |
| `proxy`                     | string  | -                  |
| `heavyProxy`                | string  | `true`             |
| `timeout`                   | Number  | `100000`           |
| `useEncodedParameters`      | boolean | `true`             |
| `authentication`            | object  | `{ type: 'none' }` |
| `dataType`                  | string  | -                  |
| `encodedParametersSettings` | object  |

```
{
    maxSize: 64 * 1024,
    maxCount: 2,
    encoder(string) {
        return window.btoa(utf8.encode(string));
    }
}
```

### Events

There is ability to subscribe for events: `requestStart`, `requestEnd`, `error`

    yt.subsribe('requestStart', function () {
        console.log('requestStart');
    });

It might be useful if you need to show the presence of active requests or if you need to log some error.

### Commands

Available commands might be found at https://ydb.tech/en/docs/, but all the commands should be written in `camelCase`:

If you don't need to define local configuration options you can you syntax:

```js
// yt.<version>.<command>(<parameters>[, <data>])
yt.v3.get({ path: "//home/user/@account" });
yt.v3.set({ path: "//home/user/@account" }, "default");
```

also there is ability to define options by `setup` field:

```js
/**
 * yt.<version>.<command>({
 *    parameters: <parameters>,
 *    data: <data>,
 *    setup: <setup>
 * })
 */
const setup = { timeout: 3000 };
yt.v3.get({ setup, parameters: { path: "//home/user/@account" } });
yt.v3.set({ setup, parameters: { path: "//home/user/@account" } }, "default");
```

### Error codes

| Error name                     | Code |
| ------------------------------ | ---- |
| `yt.codes.GENERAL_ERROR`       | 1    |
| `yt.codes.NODE_DOES_NOT_EXIST` | 500  |
| `yt.codes.NODE_ALREADY_EXISTS` | 501  |
| `yt.codes.PERMISSION_DENIED`   | 901  |
| `yt.codes.USER_IS_BANNED`      | 903  |
| `yt.codes.USER_EXCEEDED_RPS`   | 904  |

### Useful links

Backend commands registration might be found: .../yt/client/driver/driver.cpp
