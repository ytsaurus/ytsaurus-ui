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

### Configuration

By default the application uses base configuration from `path_to_dist/server/configs/common.js` file. The behavior might be adjusted through `APP_ENV` and `APP_INSTALLATION` environment variables, see [README.config.md](./docs/configuration.md) for more details.

### Docker

There is ability to build docker-image:

```
$ docker build . -t ytsaurus-ui:my-tag
```

All application files in a resulting docker-image will be placed in /opt/app, so you have to mount `/opt/app/cluster-config.json` and `/opt/app/secrets/yt-interface-secret.json`.
