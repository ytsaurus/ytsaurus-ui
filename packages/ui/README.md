## YTsaurus platform interface

User interface for a [YTsaurus platform](https://ytsaurus.tech) cluster.

### How to work with the repo

First of all you have to provide `clusters-config.json` file with description of your cluster, the file should be placed in the root of the repository (see `clusters-config.json.example`).

Additionally you have to provide `secrets/yt-interface-secret.json` file with [a token](https://ytsaurus.tech/docs/en/user-guide/storage/auth) of a special user (UIRobot) for some service requests like handling settings and other, example:

```json
{
  // common oauth token, the token is used if there is no cluster-specific token in the file
  "oauthToken": "special-user-secret-tocken",
  "cluster_id1": {
    // cluster_id1 specific oauth token
    "oauthToken": "cluster1-special-user-secret-token"
  },
  "cluster_id2": {
    // cluster_id2 specific oauth token
    "oauthToken": "cluster2-special-user-secret-token"
  }
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
$ npm deps:install
```

A simple way to start development is using your local-yt cluster. The command bellow suggests to start local-yt cluster as docker-container:

```bash
$ npm run dev:localmode
```

Another way is to provide `clusters-config.json` and run the command like:

```bash
$ npm run dev:app
```

### Docker

There is ability to build docker-image:

```
$ docker build . -t ytsaurus-ui:my-tag
```

All application files in a resulting docker-image will be placed in /opt/app, so you have to mount `/opt/app/cluster-config.json` and `/opt/app/secrets/yt-interface-secret.json`.

### Environment variables

- `YT_AUTH_ALLOW_INSECURE` - if defined allows insecure (over http) authentication, do not use it for production
- `ALLOW_PASSWORD_AUTH` - If defined, the app requires a password for cluster access

### Feature flags

There is yt-api command get_supported_feature and it is a good place to describe some features.
But some cases require ability to turn on/off a feature manually on a cluster. Such feature flags are placed placed in:

- `//sys/@ui_config` (values affects all users)
- `//sys/@ui_config_dev_overrides` (values affects only developers)

(see more detail in [YTFRONT-2804](https://nda.ya.ru/t/bgh9NWJ16fPRp4))

It is supposed that a user is developer on a cluster if he has `write` access to `admins` group of the cluster.

Available flags (**default values** are highlighted in bold):

| Flag name                              | Allowed values                                                                       | Description                                                                                                                                                                                                                                                                                                                                 |
|:---------------------------------------|:-------------------------------------------------------------------------------------|:--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| enable_per_bundle_tablet_accounting    | **true**, false                                                                      | Allows editing of resources of tablets through BundleEditorDialog [YTFRONT-2851](https://nda.ya.ru/t/xnLq-3Dm6fPYPo)                                                                                                                                                                                                                        |
| enable_per_account_tablet_accounting   | **false**, true                                                                      | Allows editing of resources of tablets through AccountEditorDialog [YTFRONT-2851](https://nda.ya.ru/t/xnLq-3Dm6fPYPo)                                                                                                                                                                                                                       |
| per_bundle_accounting_help_link        | **null**, url as string                                                              | Help link for resources of tablets to display from AccountEditorDialog about moving the resources to bundles [YTFRONT-2851](https://nda.ya.ru/t/xnLq-3Dm6fPYPo)                                                                                                                                                                             |
| enable_maintenance_api_nodes           | **null**, boolean                                                                    | Allows to use `add_maintenance`/`remove_maintenance` commands from `Comopnents/Nodes` page [YTFRONT-3792](https://nda.ya.ru/t/RvueJLzN6fWx3h)                                                                                                                                                                                               |
| enable_maintenance_api_proxies         | **null**, boolean                                                                    | Allows to use `add_maintenance`/`remove_maintenance` commands from `Components/HTTP Proxies` and `Components/RPC Proxies` pages [YTFRONT-3792](https://nda.ya.ru/t/RvueJLzN6fWx3h)                                                                                                                                                          |
| chyt_controller_base_url               | **null**, url as string                                                              | Base url for chyt-controller                                                                                                                                                                                                                                                                                                                |
| livy_controller_base_url               | **null**, url as string                                                              | Base url for spyt-controller                                                                                                                                                                                                                                                                                                                |
| job_trace_url_template                 | **null**, `{title: string; url_template: string; enforce_for_trees?: Array<string>}` | If defined adds `Job trace` item to meta-table on `Job/Details` page for a job with `archive_features/has_trace == true` and for jobs from a tree in `enforce_for_trees`, example: `{title: 'Open im MyProfiling', url_template: 'https://my.profiling.service/{cluster}/{operationId}/{jobId}', enforce_for_trees: ['tree-with-traces'] }` |
| query_tracker_default_aco              | **null**, `{stage1: string; stage2: string; }`                                       | Sets the default ACO in Query Tracker requests for each stage                                                                                                                                                                                                                                                                               |

### Configuration

By default the application uses base configuration from `path_to_dist/server/configs/common.js` file. The behavior might be adjusted through `APP_ENV` and `APP_INSTALLATION` environment variables, see [README.config.md](./docs/configuration.md) for more details.

### Migration

#### v1.17.0

- [`YT_AUTH_CLUSTER_ID`](https://github.com/ytsaurus/ytsaurus-ui/blob/ui-v1.16.1/packages/ui/README.md#environment-variables) environment variable has been replaced by [`ALLOW_PASSWORD_AUTH`](https://github.com/ytsaurus/ytsaurus-ui/blob/main/packages/ui/README.md#environment-variables).
- [`config.ytAuthCluster`](https://github.com/ytsaurus/ytsaurus-ui/blob/ui-v1.16.1/packages/ui/src/%40types/core.d.ts#L75) option has been replaced by [`config.allowPasswordAuth`](https://github.com/ytsaurus/ytsaurus-ui/blob/ui-v1.17.0/packages/ui/src/%40types/core.d.ts#L16).
