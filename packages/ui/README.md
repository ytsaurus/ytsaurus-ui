## YTsaurus platform interface

User interface for a [YTsaurus platform](https://ytsaurus.tech) cluster.

### How to work with the repo

First of all you have to provide `clusters-config.json` file with description of your cluster, the file should be placed in the root of the repository (see `clusters-config.json.example`).

Additionally you have to provide `secrets/yt-interface-secret.json` file with [a token](https://ytsaurus.tech/docs/en/user-guide/storage/auth) of a special user (UIRobot) for some service requests like handling settings and other, example:

```json
{
  // common oauth token, the token is used if there is no cluster-specific token in the file
  "oauthToken": "special-user-secret-tocken",
  "cluster_name1": {
    // cluster_name1 specific oauth token
    "oauthToken": "cluster1-special-user-secret-token"
  },
  "cluster_name2": {
    // cluster_name2 specific oauth token
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

## Development without nginx

You also could run application without nginx, right on localhost port. All that you need to do is specify port:

```bash
LOCAL_DEV_PORT=8080 YT_AUTH_ALLOW_INSECURE=true ALLOW_PASSWORD_AUTH=true npm run dev:oss
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
- `PROMETHEUS_BASE_URL` - If defined enables monitoring dashboards with prometheus data, see `Prometheus dashboards` below (the value is forwarded to `YTCoreConfig.prometheusBaseUrl`). To use authorized requests to your prometheus instance provide `prometheusAuthHeaders` field in `secrets/yt-interface-secret.json`, like:

```json
{
  "prometheusAuthHeaders": {"Authorization": "Basic xxxxxxx"}
}
```

- `GRAFANA_BASE_URL` - If defined enables links to specific dashbords when `YTCoreConfig.prometheusBaseUrl` is provided (the value is forwarded to `YTCoreConfig.uiSettings.grafanaBaseUrl`). By default the link is visible for all users, to control the visibility create `//sys/interface-monitoring/allow_grafana_url` node and add `use` permission for specific users/groups.

### Prometheus dashboards

To activate monitoring ddashboards you have to provide PROMETHEUS_BASE_URL. Additionally you have to provide documents in `//sys/interface-monitoring/` with description of dashboards:

- Account: `master-accounts`
- Tablet cell bundle: `bundle-ui-cpu`, `bundle-ui-disk`, `bundle-ui-efficiency`, `bundle-ui-lsm`, `bundle-ui-memory`, `bundle-ui-network`, `bundle-ui-resource`, `bundle-ui-rpc-proxy`, `bundle-ui-rpc-proxy-overview`, `bundle-ui-user-load`,
- System: `cluster-resources`, `master-global`, `master-local`, `scheduler-internal`,
- CHYT: `chyt-monitoring`,
- Navigation: `queue-metrics`, `queue-consumer-metrics`, `flow-general`,
- Operations: `scheduler-operation`, `job`,
- Scheduling pool: `scheduler-pool`

### Cluster specific features

There is yt-api command get_supported_feature and it is a good place to describe API features.
But some cases require ability to turn on/off a feature manually on a specific cluster. Such cluster specific optinos are placed placed in:

- `//sys/@ui_config` (values affects all users)
- `//sys/@ui_config_dev_overrides` (values affects only admins)

(see more detail in [YTFRONT-2804](https://nda.ya.ru/t/bgh9NWJ16fPRp4))

UI determines a user as an admin on the cluster if he has `write` access to `admins` group.

Available optaions (**default values** are highlighted in bold):

| Option name                         | Allowed values  | Description                                                                                                          |
| :---------------------------------- | :-------------- | :------------------------------------------------------------------------------------------------------------------- |
| enable_per_bundle_tablet_accounting | **true**, false | Allows editing of resources of tablets through BundleEditorDialog [YTFRONT-2851](https://nda.ya.ru/t/xnLq-3Dm6fPYPo) |

| enable_per_account_tablet_accounting | **false**, true | Allows editing of resources of tablets through AccountEditorDialog [YTFRONT-2851](https://nda.ya.ru/t/xnLq-3Dm6fPYPo) |

| per_bundle_accounting_help_link | **null**, url as string | Help link for resources of tablets to display from AccountEditorDialog about moving the resources to bundles [YTFRONT-2851](https://nda.ya.ru/t/xnLq-3Dm6fPYPo) |

| enable_maintenance_api_nodes | **null**, boolean | Allows to use `add_maintenance`/`remove_maintenance` commands from `Comopnents/Nodes` page [YTFRONT-3792](https://nda.ya.ru/t/RvueJLzN6fWx3h) |

| enable_maintenance_api_proxies | **null**, boolean | Allows to use `add_maintenance`/`remove_maintenance` commands from `Components/HTTP Proxies` and `Components/RPC Proxies` pages [YTFRONT-3792](https://nda.ya.ru/t/RvueJLzN6fWx3h) |

| chyt_controller_base_url | **null**, url as string | Base url for chyt-controller |

| livy_controller_base_url | **null**, url as string | Base url for spyt-controller |
| job_trace_url_template | **null**, `{title: string; url_template: string; enforce_for_trees?: Array<string>}` | If defined adds `Job trace` item to meta-table on `Job/Details` page for a job with `archive_features/has_trace == true` and for jobs from a tree in `enforce_for_trees`, example: `{title: 'Open im MyProfiling', url_template: 'https://my.profiling.service/{cluster}/{operationId}/{jobId}', enforce_for_trees: ['tree-with-traces'] }` |

| query_tracker_default_aco | **null**, `{stage1: string; stage2: string; }` | Sets the default ACO in Query Tracker requests for each stage |

| operation_performance_url_template | **null**, `{title: string; url_template: string}` | Configuration for operation performance analysis system integration. Template must contain {operation_id} placeholder which will be replaced with actual operationId |

| resource_usage_base_url | **null**, url as string | Base URL for accounts usage service to override uiSettings.accountsUsageBasePath |

| tablet_errors_base_url | **null**, url as string | Base URL for tablet errors service to override `uiSettings.tabletErrorsBaseUrl` |

| access_log_base_url | **null**, url as string | Base URL for `Navigation/Access Log` API endpoint, the option overrides `uiSettings/acccess_log_base_path` |

### Configuration

By default the application uses base configuration from `path_to_dist/server/configs/common.js` file. The behavior might be adjusted through `APP_ENV` and `APP_INSTALLATION` environment variables, see [README.config.md](./docs/configuration.md) for more details.

### Migration

#### v1.17.0

- [`YT_AUTH_CLUSTER_ID`](https://github.com/ytsaurus/ytsaurus-ui/blob/ui-v1.16.1/packages/ui/README.md#environment-variables) environment variable has been replaced by [`ALLOW_PASSWORD_AUTH`](https://github.com/ytsaurus/ytsaurus-ui/blob/main/packages/ui/README.md#environment-variables).
- [`config.ytAuthCluster`](https://github.com/ytsaurus/ytsaurus-ui/blob/ui-v1.16.1/packages/ui/src/%40types/core.d.ts#L75) option has been replaced by [`config.allowPasswordAuth`](https://github.com/ytsaurus/ytsaurus-ui/blob/ui-v1.17.0/packages/ui/src/%40types/core.d.ts#L16).

### How to run e2e on local machine

Here is an example of run & update of screenshot tests:

```bash
# Prerequsites: install docker and YTsaurus CLI
# https://www.docker.com/products/docker-desktop/
# https://ytsaurus.tech/docs/en/api/cli/install

# Terminal 1: launch local dev mode on 8080 port
LOCAL_DEV_PORT=8080 npm run dev:localmode:e2e

# Terminal 2: init local cluster
npm run e2e:localmode:init

# Terminal 2: mount repo in docker image and prepare everyting for tests run
# Make sure that you specify correct BASE_URL for e2e tests
# For linux use http://localhost:8080
# For macos use http://host.docker.internal:8080

print "Enter base url of your development stand: "; \
read BASE_URL; \
docker run --rm --network host -it -w /work \
    -v $(pwd):/work \
    -e BASE_URL=${BASE_URL} \
    "ghcr.io/gravity-ui/node-nginx:ubuntu20-nodejs18" \
    /bin/bash -c '
            cd tests
            npm ci
            npx playwright install --with-deps chromium
            cd ..
            npm run e2e:localmode:screenshots:update
'
```
