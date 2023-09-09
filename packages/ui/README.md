## YTsaurus platform interface

User interface for a [YTsaurus platform](https://ytsaurus.tech) cluster.

### How to work with the repo

First of all you have to provide `clusters-config.json` file with description of your cluster, the file should be placed in the root of the repository (see `clusters-config.json.example`).

Additionally you have to provide `secrets/yt-interface-secret.json` file with [a token](https://ytsaurus.tech/docs/en/user-guide/storage/auth) of a special user (UIRobot) for some service requests like handling settings and other, example:

```json
{
  "oauthToken": "special-user-secret-token"
}
```

### Development

To run the development environment you need to prepare and run nginx:

1. Install nginx
2. Copy file `deploy/nginx/yt.development.conf.example` to `/etc/nginx/sites-enabled/yt.development.conf`
3. Modify `/etc/nginx/sites-enabled/yt.development.conf`

- change `server_name`
- replace all `/path/to/the/repo` to correct path

4. `sudo systemctl restart nginx`

Install required dependencies:

```
$ npm ci
```

After that we can start the UI:

```bash
# my-cluster shoul be present in your clusters-config.json
$ YT_AUTH_CLUSTER_ID=my-cluster npm run dev:app
```

Also there is the ability to connect to a local yt cluster:

```bash
$ npm run dev:localmode
```

### Environment variables

- `YT_AUTH_CLUSTER_ID` - if defined enables yt-password authentication, also the cluster will be used for userSettings and for userColumnPresets
- `YT_AUTH_ALLOW_INSECURE` - if defined allows insecure (over http) authentication, do not use it for production _(the variable is ignored if `YT_AUTH_CLUSTER_ID` is not defined)_
- `YT_USER_SETTINGS_PATH` - path to map-node with files of user-settings, if not defined '//tmp' is used _(the variable is ignored if `YT_AUTH_CLUSTER_ID` is not defined)_
- `YT_USER_COLUMN_PRESETS_PATH` - path to dynamic table with user column presets _(the variable is ignored if `YT_AUTH_CLUSTER_ID` is not defined)_. The table should have two columns: **"name"** _(string, required, sort_order: ascheding)_, **"columns_json"** _(string)_.

### Feature flags

It is recommended way to link feature with version of proxies or schedulers of cluster.
But some cases require ability to turn on/off a feature manually on a cluster. Such feature flags
are placed placed in:

- `//sys/@ui_config` (values affects all users)
- `//sys/@ui_config_dev_overrides` (values affects only developers)

([more details](https://nda.ya.ru/t/bgh9NWJ16fPRp4))

It is supposed that a user is developer on a cluster if he has `write` access to `admins` group of the cluster.

Available flags (**default values** are highlighted in bold):

| Flag name                            | Allowed values          | Description                                                                                                                                                                        |
| :----------------------------------- | :---------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| web_json_value_format                | **"schemaless"**, "yql" | Allows to use `YQLv3 types` [YTFRONT-2804](https://nda.ya.ru/t/bgh9NWJ16fPRp4)                                                                                                     |
| enable_per_bundle_tablet_accounting  | **false**, true         | Allows editing of resources of tablets through BundleEditorDialog [YTFRONT-2851](https://nda.ya.ru/t/xnLq-3Dm6fPYPo)                                                               |
| enable_per_account_tablet_accounting | **true**, false         | Allows editing of resources of tablets through AccountEditorDialog [YTFRONT-2851](https://nda.ya.ru/t/xnLq-3Dm6fPYPo)                                                              |
| per_bundle_accounting_help_link      | **null**, url as string | Help link for resources of tablets to display from AccountEditorDialog about moving the resources to bundles [YTFRONT-2851](https://nda.ya.ru/t/xnLq-3Dm6fPYPo)                    |
| enable_maintenance_api_nodes         | **null**, boolean       | Allows to use `add_maintenance`/`remove_maintenance` commands from `Comopnents/Nodes` page [YTFRONT-3792](https://nda.ya.ru/t/RvueJLzN6fWx3h)                                      |
| enable_maintenance_api_proxies       | **null**, boolean       | Allows to use `add_maintenance`/`remove_maintenance` commands from `Components/HTTP Proxies` and `Components/RPC Proxies` pages [YTFRONT-3792](https://nda.ya.ru/t/RvueJLzN6fWx3h) |

|

### Configuration

By default the application uses base configuration from `path_to_dist/server/configs/common.js` file. The behavior might be adjusted through `APP_ENV` and `APP_INSTALLATION` environment variables, see [README.config.md](./docs/configuration.md) for more details.

### Docker

There is ability to build docker-image:

```
$ docker build . -t ytsaurus-ui:my-tag
```

All application files in a resulting docker-image will be placed in /opt/app, so you have to mount `/opt/app/cluster-config.json` and `/opt/app/secrets/yt-interface-secret.json`.
