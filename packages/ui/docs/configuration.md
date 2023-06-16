## Configuration

By default the application uses base configaration from `path_to_dist/server/configs/common.js` file. And it might be expanded by additional files throgh special variables:

- `APP_ENV` - if defined then tries to expand base config from `path_to_dist/server/config/{APP_ENV}.js`
- `APP_INSTALLATION` - if defined then tries to expand base config from:
  - `path_to_dist/server/config/{APP_INSTALLATION}/common.js`
  - `path_to_dist/server/config/{APP_INSTALLATION}/{APP_ENV}.js` (if APP_ENV is defined)

There are different options that allow to change behavior of the application.

#### UISettings

`uiSettings` object from config is passed to user's browser as is and might be accessed as `window.__DATA__.uiSettings`.

##### `uiSettings.schedulingMonitoring`

```ts
{
  schedulingMonitoring: {urlTemplate: string; tabName?: string}
}
```

`schedulingMonitoring.urlTemplate` allows to defined parametrized template of url for external monitoring dashbord of a pool.
If defined then 'Monitoring' tab will be present as a link generated from the template on a page of a pool.
The template supports following parameters: `{ytCluster}`, `{ytPool}`, `{ytPoolTree}`, all the parameters will be replaced with corresponiding values.
Example of usage:

```ts
export default {
  uiSettings: {
    schedulingMonitoring: {
      urlTemplate:
        'https://monitoring-service.my-domain.com/some/dashboard?var-pool={ytPool}&var-tree={ytPoolTree}&var-cluster={ytCluster}',
      tabName: 'My monitoring',
    },
  },
};
```
