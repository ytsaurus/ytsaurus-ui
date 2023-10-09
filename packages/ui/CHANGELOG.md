* @gravity-ui/uikit v5

# Changelog

## [0.23.0](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v0.22.0...ui-v0.23.0) (2023-10-02)


### Features

* **Components/HttpProxies,RPCProxies:** Add NodeMaintenance modal [YTFRONT-3792] ([f1a68bd](https://github.com/ytsaurus/ytsaurus-ui/commit/f1a68bdb534af5279e80a8fd703d09f8eaac77af))
* **Components/Nodes:** add NodeMaintenanceModal [YTFRONT-3792] ([1b01b70](https://github.com/ytsaurus/ytsaurus-ui/commit/1b01b70dcafde2beee6fcadc60beec6555085d4b))

## [0.22.0](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v0.21.1...ui-v0.22.0) (2023-09-29)


### Features

* **QT:** add SPYT engine option [YTFRONT-3872] ([ec04fe3](https://github.com/ytsaurus/ytsaurus-ui/commit/ec04fe33bafe280d376d8ccc457f6a15726b87de))


### Bug Fixes

* **Scheduling:** Ephemeral pools should be visible [YTFRONT-3708] ([65dd571](https://github.com/ytsaurus/ytsaurus-ui/commit/65dd571d9fa46fbfbfdf2fa2a149b08e556c92ec))
* uncaught error from browser's console ([9bfe4a4](https://github.com/ytsaurus/ytsaurus-ui/commit/9bfe4a489ec67d1e7556d1c815217823234a45f8))

## [0.21.1](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v0.21.0...ui-v0.21.1) (2023-09-26)


### Bug Fixes

* **Components/Versions:** fix state,banned columns for Details [YTFRONT-3854] ([eed0e91](https://github.com/ytsaurus/ytsaurus-ui/commit/eed0e9137460c27caf6b7303bbab1270c6a4217e))
* **Components/Versions:** use 'cluster_node' instead of 'node' [YTFRONT-3854] ([d60950d](https://github.com/ytsaurus/ytsaurus-ui/commit/d60950d4be467830dd924ea7f883eefffae000a8))

## [0.21.0](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v0.20.0...ui-v0.21.0) (2023-09-19)


### Features

* **Navigation:** use [@effective_expiration](https://github.com/effective) attribute [YTFRONT-3665] ([6eafe35](https://github.com/ytsaurus/ytsaurus-ui/commit/6eafe35452282cfaff96123e808da59db02964f3))


### Bug Fixes

* **System/Nodes:** minor fix for firefox/safari [YTFRONT-3297] ([c537054](https://github.com/ytsaurus/ytsaurus-ui/commit/c537054a752b423bac9204348fe86de25fdabcc4))

## [0.20.0](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v0.19.1...ui-v0.20.0) (2023-09-15)


### Features

* **System/Nodes,HttpProxies,RPCProxies:** new design for details [YTFRONT-3297] ([5fd5795](https://github.com/ytsaurus/ytsaurus-ui/commit/5fd5795c72a9643ab1a4cb6e17f328d00111110a))

## [0.19.1](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v0.19.0...ui-v0.19.1) (2023-09-14)


### Bug Fixes

* **System/Masters:** minor fixes for 'voting' flag [YTFRONT-3832] ([0b7df45](https://github.com/ytsaurus/ytsaurus-ui/commit/0b7df45f2feba18ded63b9020d89a578c52fbf09))

## [0.19.0](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v0.18.0...ui-v0.19.0) (2023-09-13)


### Features

* **System/Master:** display 'nonvoting'-flag [YTFRONT-3832] ([77a5953](https://github.com/ytsaurus/ytsaurus-ui/commit/77a5953d07ce5f53fd56f1267c8888a3e6cd2e6a))
* **Odin:** add Odin page [YTFRONT-3856] ([396a4cc](https://github.com/ytsaurus/ytsaurus-ui/commit/396a4cc04f426fbff9313350a3e8a1175771ce8c))


### Bug Fixes

* **AccountQuotaEditor:** better handling for /[@allow](https://github.com/allow)_children_limit_overcommit [YTFRONT-3839] ([d53ba9a](https://github.com/ytsaurus/ytsaurus-ui/commit/d53ba9a533f0f299b0bf2a1636c88c39000248a3))
* do not load '[@alerts](https://github.com/alerts)' from Components/Nodes ([38e4a90](https://github.com/ytsaurus/ytsaurus-ui/commit/38e4a90bb877033525a9d729c1c772e2b701cef9))
* **Navigation/Jobs:** use direct links for commands: read_file, get_job_input, get_job_stderr, get_job_fail_context [YTFRONT-3833] ([7f549b2](https://github.com/ytsaurus/ytsaurus-ui/commit/7f549b2e591d7da1d5e0370b979d62cbab903881))
* **Navigation:** add ability to remove table from current path [YTFRONT-3837] ([ad016ac](https://github.com/ytsaurus/ytsaurus-ui/commit/ad016ac17e0c51f33b2d9bb2364d7d1b00fa6e07))
* **PoolEditorDialog:** remove 'Burst RAM', 'Flow RAM' fields [YTFRONT-3838] ([29541f4](https://github.com/ytsaurus/ytsaurus-ui/commit/29541f4981183a70fa8e8777bd4b8d736ea89c7f))

## [0.18.0](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v0.17.0...ui-v0.18.0) (2023-09-07)


### Features

* **BundleEditor:** check user permissions for 'write' [YTFRONT-3785] ([35dc1d0](https://github.com/ytsaurus/ytsaurus-ui/commit/35dc1d099956876a826d1f9088baae85169260b6))
* **Tablet:** turn off StoresDialog for tablet with more than 200 stores [YTFRONT-3766] ([d1f64d1](https://github.com/ytsaurus/ytsaurus-ui/commit/d1f64d1c9dce8e283b3c4ccde35857ac3217efca))


### Bug Fixes

* **Navigation:** display cyrillic nodes caption and breadcrumbs [YTFRONT-3784] ([715c1ad](https://github.com/ytsaurus/ytsaurus-ui/commit/715c1ad985d18076436cbe24c16d9707c41e9ace))
* **QT:** refactor polling, fix endless running state [YTFRONT-3852] ([2c7b283](https://github.com/ytsaurus/ytsaurus-ui/commit/2c7b283e0020e72ae81156917c83d5a051ce80a3))

## [0.17.0](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v0.16.1...ui-v0.17.0) (2023-08-30)


### Features

* **QT:** check and display query results meta with errors [YTFRONT-3797] ([d9a6d15](https://github.com/ytsaurus/ytsaurus-ui/commit/d9a6d152233513486aba0c9f9e1818862af7f344))
* **QT:** decorate errors in monaco-editor [YTFRONT-3797] ([7c74a8d](https://github.com/ytsaurus/ytsaurus-ui/commit/7c74a8d0e39e5f6dd49db48c77e7a1a771948c31))


### Bug Fixes

* **QT:** results tab data update dependencies ([baf8166](https://github.com/ytsaurus/ytsaurus-ui/commit/baf81669223f9274d3a98d7e2739db314f06d1a6))
* url params encoding, show escaped symbols for paths [YTFRONT-3784] ([6ff0a63](https://github.com/ytsaurus/ytsaurus-ui/commit/6ff0a6324bbd86e9e660149a4385e224e2db4350))

## [0.16.1](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v0.16.0...ui-v0.16.1) (2023-08-21)


### Bug Fixes

* update monaco versions ([c54b83a](https://github.com/ytsaurus/ytsaurus-ui/commit/c54b83ad02cfbf873a5e3080c03417a6e166572e))

## [0.16.0](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v0.15.0...ui-v0.16.0) (2023-08-15)


### Features

* **Job/Specification:** read specification from 'job_spec_ext' [YTFRONT-3802] ([108f2e9](https://github.com/ytsaurus/ytsaurus-ui/commit/108f2e9be5bc68b63296f8f2dac1831aa528597a))

## [0.15.0](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v0.14.2...ui-v0.15.0) (2023-08-07)


### Features

* **CreateDirectoryModal:** add 'recursive' parameter [YTFRONT-3805] ([6ffd436](https://github.com/ytsaurus/ytsaurus-ui/commit/6ffd4361210b4687e15ca75eec289d83207c90aa))
* **Navigation/Tablets:** add overlapping_store_count to dynTable Histogram [YTFRONT-3380] ([4232709](https://github.com/ytsaurus/ytsaurus-ui/commit/423270902484a3c578cf7178ca04c6a8265f5f4d))
* **OperationJobsTable:** format jobs type coloumn value [YTFRONT-3746] ([dba10c8](https://github.com/ytsaurus/ytsaurus-ui/commit/dba10c871a7c265d6a402e6cdf1255e8feb36d02))


### Bug Fixes

* a fix for misprint [YTFRONT-3804] ([daae1a9](https://github.com/ytsaurus/ytsaurus-ui/commit/daae1a9ed0fb6933d6ef4748778fdc53e8bf09a5))
* **OperationDetails:** better layout for 'Environment' [YTFRONT-3781] ([c28804e](https://github.com/ytsaurus/ytsaurus-ui/commit/c28804e5e2c7005cfa3751865b01e3177d4e1245))
* replace //sys/proxies with //sys/http_proxies [YTFRONT-3799] ([595e8fe](https://github.com/ytsaurus/ytsaurus-ui/commit/595e8fe86e3afbf7243b05ec1c2eda2e18ef299c))
* sort state parsing for url-mapping [YTFRONT-3707] ([b3c4e66](https://github.com/ytsaurus/ytsaurus-ui/commit/b3c4e665c86064102be2f9a44faad519cff27b6d))
* **Table/Dynamic:** search by keys does not work [YTFRONT-3808] ([98341af](https://github.com/ytsaurus/ytsaurus-ui/commit/98341af2f8358b094defdba6daeedb0013552226))

## [0.14.2](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v0.14.1...ui-v0.14.2) (2023-07-28)


### Bug Fixes

* **deploy:** minor fix for superviord ([1d49499](https://github.com/ytsaurus/ytsaurus-ui/commit/1d494998b880a06c91cb01b36e7ca9cf049fe4ff))

## [0.14.1](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v0.14.0...ui-v0.14.1) (2023-07-27)


### Bug Fixes

* **Dockerfile:** minor fix for building image ([ee00ecd](https://github.com/ytsaurus/ytsaurus-ui/commit/ee00ecdb9eebf4878737aae5d94a7c792b27dea7))

## [0.14.0](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v0.13.1...ui-v0.14.0) (2023-07-27)

### Features

* **dev:** use nodejs 18 ([9af6662](https://github.com/ytsaurus/ytsaurus-ui/commit/9af666268fd7e0c2e56317503a06edc86d792172))

### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @ytsaurus/interface-helpers bumped from ^0.3.0 to ^0.4.0
    * @ytsaurus/javascript-wrapper bumped from ^0.2.1 to ^0.3.0

## [0.13.1](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v0.13.0...ui-v0.13.1) (2023-07-27)

### Bug Fixes

* **Components/Node/MemoryUsage:** use virtualized table [YTFRONT-3796] ([267eeef](https://github.com/ytsaurus/ytsaurus-ui/commit/267eeeffbfa3a559d1cf74296492dbfb3644289d))
* **Components/Node:** bring back missing locations [YTFRONT-3796] ([d3686b3](https://github.com/ytsaurus/ytsaurus-ui/commit/d3686b31c76cd8ac365f54337ebe41434c420ea3))

## [0.13.0](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v0.12.0...ui-v0.13.0) (2023-07-26)


### Features

* **QT:** add QT request settings override with UI [YTFRONT-3790] ([95479bb](https://github.com/ytsaurus/ytsaurus-ui/commit/95479bbabdd260e148879a3be2623ec9f008979f))

## [0.12.0](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v0.11.3...ui-v0.12.0) (2023-07-21)


### Features

* **Components/Nodes:** use attributes.paths and attributes.keys for list of nodes [YTFRONT-3378] ([a60ec5e](https://github.com/ytsaurus/ytsaurus-ui/commit/a60ec5e191a14221400b610c94aa15cf4fe670da))
* enable query name editing [YTFRONT-3649] ([f375ea4](https://github.com/ytsaurus/ytsaurus-ui/commit/f375ea468543299b7a18d2b92417b9966c8e664c))


### Bug Fixes

* **PoolEditorDialog:** weight field remove request when value was not changed [YTFRONT-3748] ([1d25e5b](https://github.com/ytsaurus/ytsaurus-ui/commit/1d25e5bd0fabb720a5121fdc11ade5692e2fccd2))
* QT format decimal number results [YTFRONT-3782] ([58d6f66](https://github.com/ytsaurus/ytsaurus-ui/commit/58d6f66ac684774e1a45d656b8dfda9d9a9e5af8))

## [0.11.3](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v0.11.2...ui-v0.11.3) (2023-07-14)


### Bug Fixes

* README ([cd2d3db](https://github.com/ytsaurus/ytsaurus-ui/commit/cd2d3dbe2e75341274a9c0a71f36db1ee34878f2))

## [0.11.2](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v0.11.1...ui-v0.11.2) (2023-07-14)


### Bug Fixes

* PoolEditorDialog weight field [YTFRONT-3748] ([c906006](https://github.com/ytsaurus/ytsaurus-ui/commit/c906006730658e7633678e8b7d66036d468affc2))
* Scheduling page fix ui handling parsing pools errors [YTFRONT-3748] ([facc1d6](https://github.com/ytsaurus/ytsaurus-ui/commit/facc1d648f2f379efaf5e7fb96daae8f70f83f5a))
* ui lock ([03940a6](https://github.com/ytsaurus/ytsaurus-ui/commit/03940a6c2240cabc78f5592b99e7540d32c1531e))

## [0.11.0](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v0.10.0...ui-v0.11.0) (2023-07-06)


### Features

* Add UISettings.accountsMonitoring config option [YTFRONT-3698] ([71a8902](https://github.com/ytsaurus/ytsaurus-ui/commit/71a8902344892881bad6cd8d43f56a04efad3ebc))
* Add UISettings.bundlesMonitoring config option [YTFRONT-3698] ([ff7f90a](https://github.com/ytsaurus/ytsaurus-ui/commit/ff7f90ae7eb4404332ed627e5f34e8eeb3a109df))
* Add UISettings.operationsMonitoring config option [YTFRONT-3698] ([893f716](https://github.com/ytsaurus/ytsaurus-ui/commit/893f71618dd6929fb2eef8d3bb5d87e46f67e950))
* Add UISettings.schedulingMonitoring config option [YTFRONT-3698] ([eb1959b](https://github.com/ytsaurus/ytsaurus-ui/commit/eb1959bf5e9bb75c967c1c2cbff0ca84f70a4f59))
* **Components/Nodes:** Add 'Chaos slots' view mode [YTFRONT-3333] ([9aa0461](https://github.com/ytsaurus/ytsaurus-ui/commit/9aa046177d4a25f1dd7d6ea10c1f58a628bc4e51))


### Bug Fixes

* improve QT engine switching behaviour / rework Open Query Tracker button [YTFRONT-3713] ([0453125](https://github.com/ytsaurus/ytsaurus-ui/commit/045312528754dde84bc4fcc7f9156248c7db2348))

## [0.10.0](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v0.9.1...ui-v0.10.0) (2023-07-04)


### Features

* **BundleControllerEditor:** add 'Reserved' field [YTFRONT-3673] ([4e497e1](https://github.com/ytsaurus/ytsaurus-ui/commit/4e497e1b7f7f508d771ee54027dc2c627f706edf))

## [0.9.1](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v0.9.0...ui-v0.9.1) (2023-06-26)


### Bug Fixes

* Changelog tiny fix ([21ad9cf](https://github.com/ytsaurus/ytsaurus-ui/commit/21ad9cf5a4e4c9c8499eb54d5b9d2d1c8492e863))

## [0.9.0](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v0.8.0...ui-v0.9.0) (2023-06-20)


### Features

* enable delete action for OS [YTFRONT-3721] ([8f6d7ed](https://github.com/ytsaurus/ytsaurus-ui/commit/8f6d7ede82bbd41fdfd0fc9c562777c5409c952b))
* enable ManageAcl form [YTFRONT-3721] ([6a49956](https://github.com/ytsaurus/ytsaurus-ui/commit/6a49956e0c97a4e972335bd068e43ea342cf5793))
* enable PERMISSIONS_SETTINGS override with UIFactory [YTFRONT-3721] ([99ab661](https://github.com/ytsaurus/ytsaurus-ui/commit/99ab6610385d34816e700a4838fbb24a624b077f))
* enable Request Permission form for os version [YTFRONT-3721] ([6634f50](https://github.com/ytsaurus/ytsaurus-ui/commit/6634f50c51b4f78ebbd54fbcc2fe0bdd5f8875c9))

## [0.8.0](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v0.7.0...ui-v0.8.0) (2023-06-19)


### Features

* remote copy modal -&gt; suggest transfer_* pool if exists [YTFRONT-3511] ([19674ea](https://github.com/ytsaurus/ytsaurus-ui/commit/19674eade06d19adf6ab141a5662b2f922e305f1))


### Bug Fixes

* (PoolEditorDialog) add number validation to Weight field [YTFRONT-3748] ([84b4fde](https://github.com/ytsaurus/ytsaurus-ui/commit/84b4fde9605b1cb693478d1b0706c050da5c3ecb))

## [0.7.0](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v0.6.4...ui-v0.7.0) (2023-06-16)


### Features

* **Navigation/AttributesEditor:** allow to edit '/[@expiration](https://github.com/expiration)_time' and '/[@expiration](https://github.com/expiration)_timout' [YTFRONT-3665] ([9983381](https://github.com/ytsaurus/ytsaurus-ui/commit/9983381cb7a4eaa09e5d82b5e8ed6232e49cd0b1))
* **System/Nodes:** add 'Node type' filter [YTFRONT-3163] ([9e7a956](https://github.com/ytsaurus/ytsaurus-ui/commit/9e7a9564dcded3044f866d4ab55bb118a3a50a40))


### Bug Fixes

* ACL page tables styles [YTFRONT-3758] ([0c97d70](https://github.com/ytsaurus/ytsaurus-ui/commit/0c97d70b5504258e1a22eccc7ca4e4ac9f3b55d8))

## [0.6.4](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v0.6.3...ui-v0.6.4) (2023-06-02)


### Bug Fixes

* get rid of unnecessary console.log ([6d06778](https://github.com/ytsaurus/ytsaurus-ui/commit/6d06778b6f9eea1ab834807ee4e68061d362b5a9))

## [0.6.3](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v0.6.2...ui-v0.6.3) (2023-06-02)


### Bug Fixes

* add @gravity-ui/dialog-fields to peerDeps ([7a23bce](https://github.com/ytsaurus/ytsaurus-ui/commit/7a23bce132fbf479728b9ae85f1e88f3efc174e4))
* increase jobsCount limit for JobsMonitor tab [YTFRONT-3752] ([9e61525](https://github.com/ytsaurus/ytsaurus-ui/commit/9e61525d601ccc42ecb94ed326dbee6e03f71728))

## [0.6.2](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v0.6.1...ui-v0.6.2) (2023-06-01)


### Bug Fixes

* **Navigation:** Do not load pool tree unless necessary [YTFRONT-3747] ([61192df](https://github.com/ytsaurus/ytsaurus-ui/commit/61192dfa7d2c38a0ace6a2bc0c80ae178a4ebedc))

## [0.6.1](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v0.6.0...ui-v0.6.1) (2023-06-01)


### Bug Fixes

* **JobsMonitor:** fix a misprint in warning ([6945d1e](https://github.com/ytsaurus/ytsaurus-ui/commit/6945d1e5f052281ff08e92a8b924ea224be1a2eb))

## [0.6.0](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v0.5.1...ui-v0.6.0) (2023-05-25)


### Features

* Add 'register_queue_consumer', 'register_queue_consumer_vital' permissions [YTFRONT-3327] ([d6bd889](https://github.com/ytsaurus/ytsaurus-ui/commit/d6bd8890c2e62c96448043ac44ffa70a83178142))
* **Navigation/Consumer:** Model is changed from 'many-to-one' to 'many-to-many' [YTFRONT-3327] ([2014422](https://github.com/ytsaurus/ytsaurus-ui/commit/2014422b5797000fdda66feb51ca441874b03e38))


### Bug Fixes

* **Account/General:** minor fix for styles [YTFRONT-3741] ([7eea79a](https://github.com/ytsaurus/ytsaurus-ui/commit/7eea79adc103ecddd773144acfbe6e74e3f58863))
* **Scheduling/PoolSuggest:** better order of items [YTFRONT-3739] ([150db4f](https://github.com/ytsaurus/ytsaurus-ui/commit/150db4fc1c33cb448a1f9ba3faa6e88c1b67c33c))

## [0.5.1](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v0.5.0...ui-v0.5.1) (2023-05-19)


### Bug Fixes

* (OperationsArchiveFilter) input styles specificity [YTFRONT-3728] ([b587906](https://github.com/ytsaurus/ytsaurus-ui/commit/b587906c21552ba584fdff35a6b48a2582ddde70))
* (OperationsArchiveFilter) reseting time on date change and custom date initial value on toggle modes [YTFRONT-3728] ([fdfd045](https://github.com/ytsaurus/ytsaurus-ui/commit/fdfd0456d8fcf49bc24316f533d511c1b8275147))
* **TabletCellBundle:** better layout for MetaTable [YTFRONT-3716] ([6904a4c](https://github.com/ytsaurus/ytsaurus-ui/commit/6904a4cd7574c1061cedcba9ba4454cf04791aec))

## [0.5.0](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v0.4.2...ui-v0.5.0) (2023-05-10)


### Features

* ACL: add object permissions own filters [YTFRONT-3720] ([d9dfed1](https://github.com/ytsaurus/ytsaurus-ui/commit/d9dfed146bd72c248003350dc0f1a3c228801dfc))


### Bug Fixes

* get path from attributes for Schema component [YTFRONT-3722] ([97bca2c](https://github.com/ytsaurus/ytsaurus-ui/commit/97bca2cea18c582697a7375396c7b17c89499e67))

## [0.4.2](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v0.4.1...ui-v0.4.2) (2023-05-03)


### Bug Fixes

* **JobDetails/StatisticsIO:** total row should be displayed propertly [YTFRONT-3723] ([980a4fc](https://github.com/ytsaurus/ytsaurus-ui/commit/980a4fc19564e36aee4716dd35259af986b78ff0))
* **Navigation:TableMeta:** hide dyn-table attributes for static tables [YTFRONT-3725] ([4fa79f7](https://github.com/ytsaurus/ytsaurus-ui/commit/4fa79f7b9e3182c542510060d682f2421fe9ca85))
* **Navigation/Table:** fix error for specific value of localStorage.SAVED_COLUMN_SETS [YTFRONT-3710] ([529d8bf](https://github.com/ytsaurus/ytsaurus-ui/commit/529d8bf9577171335e42fcd72378c358c7a38a62))
* **Scheduling/Overview:** add more levels to stylets [YTFRONT-3724] ([d3dca2b](https://github.com/ytsaurus/ytsaurus-ui/commit/d3dca2b6323ce24dbe18b6cf978cdbc1843ddf8a))
* **TabletCellBundle:** better layout for meta-table [YTFRONT-3716] ([f1073b8](https://github.com/ytsaurus/ytsaurus-ui/commit/f1073b82480a13d64e40aae460da73290de09e36))

## [0.4.1](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v0.4.0...ui-v0.4.1) (2023-04-28)


### Bug Fixes

* **Navigation/MapNode:** Names should not be cut with ellipsis [YTFRONT-3711] ([8a48398](https://github.com/ytsaurus/ytsaurus-ui/commit/8a48398007ca289881668032f8b17dabda2dafde))

## [0.4.0](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v0.3.1...ui-v0.4.0) (2023-04-27)


### Features

* add 'Stale' flag to Job's metadata [YTFRONT-3712] ([6ed4597](https://github.com/ytsaurus/ytsaurus-ui/commit/6ed45979195ca638b99cd895c3aa0a80fe07b561))
* add inherited popover tip [YTFRONT-3529] ([d4c76ab](https://github.com/ytsaurus/ytsaurus-ui/commit/d4c76ab893db9a4bacf77b1eb245408644194a37))
* correct subjects filtering for groups [YTFRONT-3529] ([93d8500](https://github.com/ytsaurus/ytsaurus-ui/commit/93d85003639d426a2835949f482fec088cf19f0b))
* remove highlighting [YTFRONT-3529] ([dc74075](https://github.com/ytsaurus/ytsaurus-ui/commit/dc74075ab1ab795c3ef935e15ed01f267e432459))
* split and filter objectPermissions [YTFRONT-3529] ([93d8500](https://github.com/ytsaurus/ytsaurus-ui/commit/93d85003639d426a2835949f482fec088cf19f0b))
* **Table:** Add 'Combine chunks' flag to Merge/Erase modal ([aeec0ca](https://github.com/ytsaurus/ytsaurus-ui/commit/aeec0cabd87d4ec896f54972240a7708cfa9f531))


### Bug Fixes

* ACL grid column sizes [YTFRONT-3529] ([e0bd03b](https://github.com/ytsaurus/ytsaurus-ui/commit/e0bd03bcab24913f6fac82c3438bdb6db39e893f))
* acl subject column ellipsis [YTFRONT-3529] ([7a7fd4e](https://github.com/ytsaurus/ytsaurus-ui/commit/7a7fd4e2e91e0911100dc2c5c2070797c60783bc))
* **BundleController:** handle properly case when bundle controller is unavailable [YTFRONT-3636] ([940a441](https://github.com/ytsaurus/ytsaurus-ui/commit/940a44155aac3624567ba0c709b962ee9957c717))
* **Navigation:** add 'disabled'-flag for 'More actions' button [YTFRONT-3705] ([fa4226a](https://github.com/ytsaurus/ytsaurus-ui/commit/fa4226a082521c7ef693178fbf53a599e31a49b0))
* **Operation/Statistics:** fix for strange behavior of 'Collapse all' button [YTFRONT-3719] ([e4d55aa](https://github.com/ytsaurus/ytsaurus-ui/commit/e4d55aacfb60c8d0b319c8098c1485c3e46a7b0a))

## [0.3.1](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v0.3.0...ui-v0.3.1) (2023-04-19)


### Bug Fixes

* **Table/Schema:** minor fix for width of columns [YTFRONT-3667] ([0abe89d](https://github.com/ytsaurus/ytsaurus-ui/commit/0abe89d7d570c662ae6646622b904f98f9297e7f))

## [0.3.0](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v0.2.3...ui-v0.3.0) (2023-04-18)


### Features

* **Operation/Statistics:** add pool-tree filter (statistics-v2) [YTFRONT-3598] ([8b03968](https://github.com/ytsaurus/ytsaurus-ui/commit/8b039687f2e9025baa9bdaec861866ac2c3443ef))

## [0.2.3](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v0.2.2...ui-v0.2.3) (2023-04-17)


### Bug Fixes

* bring back telemetry ([b24d977](https://github.com/ytsaurus/ytsaurus-ui/commit/b24d977b78273105f8e3f49b1ad3d0946160320b))

## [0.2.2](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v0.2.1...ui-v0.2.2) (2023-04-14)


### Bug Fixes

* add  for tablets with 0 Cells [YTFRONT-3696] ([63acb21](https://github.com/ytsaurus/ytsaurus-ui/commit/63acb214a5f25ad6458daddc8db9d5fa93eed91f))
* rework font select [YTFRONT-3691] ([717fa89](https://github.com/ytsaurus/ytsaurus-ui/commit/717fa89ad5aceca74e6587d444b672d50ba2ed07))

## [0.2.1](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v0.2.0...ui-v0.2.1) (2023-04-07)


### Bug Fixes

* remove unnecessary files ([f4b51c2](https://github.com/ytsaurus/ytsaurus-ui/commit/f4b51c2a5a79705913adf3377e1590ad5368d1fb))

## [0.2.0](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v0.1.0...ui-v0.2.0) (2023-04-06)


### Features

* Add tutorials list ([8241d3a](https://github.com/ytsaurus/ytsaurus-ui/commit/8241d3a933877113b4a1b3a452e84a46417bbebe))


### Bug Fixes

* typos and abc missing link Edit Bundle Form [YTFRONT-3676] ([aa617d3](https://github.com/ytsaurus/ytsaurus-ui/commit/aa617d3fad7ad1bfd14e0217d44599dd895bc24b))

## [0.1.0](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v0.0.4...ui-v0.1.0) (2023-04-05)


### Features

* Add button to create a query from table ([7c94ee5](https://github.com/ytsaurus/ytsaurus-ui/commit/7c94ee5286d96c0ffb617d16e41020b4e92e08d7))
* add QT proxy ([c624e5d](https://github.com/ytsaurus/ytsaurus-ui/commit/c624e5d847d96dbd9045bb38019811c367ea666c))


### Bug Fixes

* add settings queryTrackerCluster for ya-env. Reset screen setting after close QTWidget. ([215a72b](https://github.com/ytsaurus/ytsaurus-ui/commit/215a72b6c5ca023c97ded4208d4d50c8f1d8642a))
* EditableAsText with controls (used in QT TopRowElement) ([574dbae](https://github.com/ytsaurus/ytsaurus-ui/commit/574dbae73de87f726152ffba809a03629c4a7d3a))
* fix encoding in query text and results ([d3e2780](https://github.com/ytsaurus/ytsaurus-ui/commit/d3e2780852a82b90ad0af2aace6c7a697220ad5c))
* fix for broken layout of bundles editor ([b389ea8](https://github.com/ytsaurus/ytsaurus-ui/commit/b389ea85ce0d5e46318c8e1f00081a56fec02851))
* Fix for default CHYT-alias ([9231085](https://github.com/ytsaurus/ytsaurus-ui/commit/9231085899ef64dd73add88989771e509fa43346))
* style draft queries. Fix queries without finish_time. Read scheme from get_result_table ([fdd121a](https://github.com/ytsaurus/ytsaurus-ui/commit/fdd121a589090f045bc805b1106f02444539c609))

## [0.0.4](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v0.0.3...ui-v0.0.4) (2023-03-24)


### Bug Fixes

* **ui:** add 'files' field to package.json ([cb51d75](https://github.com/ytsaurus/ytsaurus-ui/commit/cb51d756af502f25fab413ff26c20b5e2ce90abf))

## [0.0.3](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v0.0.2...ui-v0.0.3) (2023-03-24)


### Bug Fixes

* ytsaurus/ui docker image fixed for localmode ([5033eb9](https://github.com/ytsaurus/ytsaurus-ui/commit/5033eb9c1c5ab4aaf8029c678847231eb7a6bd18))

## [0.0.2](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v0.0.1...ui-v0.0.2) (2023-03-24)


### Bug Fixes

* add missing config ([e391c59](https://github.com/ytsaurus/ytsaurus-ui/commit/e391c59fdf5c0ee72e8899daae0dfd3d4e34f4e7))
