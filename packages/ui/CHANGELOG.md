# Changelog

## [1.32.0](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v1.31.0...ui-v1.32.0) (2024-05-07)


### Features

* added ability to render custom query tab at query-tracker page ([193d24b](https://github.com/ytsaurus/ytsaurus-ui/commit/193d24bcf12588579b27331e3553a72fc8b17ab8))
* **Query:** added file editor [YTFRONT-3984] ([3ca0b33](https://github.com/ytsaurus/ytsaurus-ui/commit/3ca0b33b3a834b090238d71763c833338699d0f2))


### Bug Fixes

* **Accounts:** select problem [YTADMINREQ-41653] ([a742969](https://github.com/ytsaurus/ytsaurus-ui/commit/a7429691c93d1884a2e2adf5d5b78b059c63bb9c))
* fix lint errors ([5250818](https://github.com/ytsaurus/ytsaurus-ui/commit/5250818deead43893caaf8f036493fa88e914442))
* **Host:** add ellipsis text in host ([2342404](https://github.com/ytsaurus/ytsaurus-ui/commit/2342404235fa050acd6f3046f966f48ca3bbd133))
* **Host:** remove classname ([70a7558](https://github.com/ytsaurus/ytsaurus-ui/commit/70a75582a7d77832d8402953e4560a0caeb955dd))
* **Host:** review changes ([5742f26](https://github.com/ytsaurus/ytsaurus-ui/commit/5742f2643ec7db5b67e641edb63ea0497119d74d))
* **Navigation:** text bug in tablets layout [YTFRONT-4133] ([ca58a9e](https://github.com/ytsaurus/ytsaurus-ui/commit/ca58a9e12eaabf1933ee7dc37bffd4d51581f3a8))
* **Navigation:** wrong symlinks path [YTFRONT-4128] ([f43e6f7](https://github.com/ytsaurus/ytsaurus-ui/commit/f43e6f7621f770f8fd94c1a1d23a76ad539e029b))
* **Query:** autocompete error old safari [YTFRONT-4125] ([bacb350](https://github.com/ytsaurus/ytsaurus-ui/commit/bacb350f21499e421c5309bdd5cab4a12a329110))
* **Query:** generating a query from a table [YTFRONT-4137] ([0fd3271](https://github.com/ytsaurus/ytsaurus-ui/commit/0fd3271fd9b543a4136502a52c749343a177e43f))

## [1.31.0](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v1.30.0...ui-v1.31.0) (2024-04-19)


### Features

* **ACL/RequestPermissions:** add all permission for Navigation [[#474](https://github.com/ytsaurus/ytsaurus-ui/issues/474)] ([fb219aa](https://github.com/ytsaurus/ytsaurus-ui/commit/fb219aa6a3b8df0a33848d18b876499a29903fad))
* **ACL:** request read permission for column group [YTFRONT-3482] ([62e9504](https://github.com/ytsaurus/ytsaurus-ui/commit/62e95048be674fd45f114d35875841689f2003c1))
* **ACL:** use separate tab for columns [YTFRONT-3836] ([374003a](https://github.com/ytsaurus/ytsaurus-ui/commit/374003ac979bb5a91e2dfff5d447c88c411b51e3))
* **Query:** change new query button to link [YTFRONT-4093] ([320cd98](https://github.com/ytsaurus/ytsaurus-ui/commit/320cd989a5b88ee93973e97113b243f06bb8968c))
* **Query:** spyt ytql autocomplete [YTFRONT-4118] ([ca86bb8](https://github.com/ytsaurus/ytsaurus-ui/commit/ca86bb84ceae35aa4b3cda11b38345ec7e26dc9c))


### Bug Fixes

* **ACL/RequestPermissions:** handle path from attributes of error [YTFRONT-3502] ([f078a89](https://github.com/ytsaurus/ytsaurus-ui/commit/f078a89950169a642a48366b122492ffbfbd4b60))
* **Navigation:** allow to open items without access [YTFRONT-3836] ([0ad6f51](https://github.com/ytsaurus/ytsaurus-ui/commit/0ad6f514d9fc11c8f868e6c78ec804d918a7db31))
* **QueryTracker:** fix request parameters for validate and explain buttons in yql query [[#370](https://github.com/ytsaurus/ytsaurus-ui/issues/370)] ([85c052e](https://github.com/ytsaurus/ytsaurus-ui/commit/85c052ee5abfa3f825739829602c238ddb902e54))
* **userSettings:** user settings are not applied if you go to the cluster from the page with clusters [[#471](https://github.com/ytsaurus/ytsaurus-ui/issues/471)] ([37c2642](https://github.com/ytsaurus/ytsaurus-ui/commit/37c26422e1aa6923fa5e48929ef7673f4afb038c))

## [1.30.0](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v1.29.0...ui-v1.30.0) (2024-04-17)


### Features

* **UserCard:** add UserCard support in UIFactory ([c99fae5](https://github.com/ytsaurus/ytsaurus-ui/commit/c99fae5158143a77fa43b0f92ad7a18aba6d2240))


### Bug Fixes

* **Query:** error while parsing yson [YTFRONT-4110] ([11b71cf](https://github.com/ytsaurus/ytsaurus-ui/commit/11b71cf7a4f96bcf788b19a2c87313eaf1596214))
* **QueryTracker:** fix request parameters for validate and explain buttons in yql query [[#370](https://github.com/ytsaurus/ytsaurus-ui/issues/370)] ([65abfc5](https://github.com/ytsaurus/ytsaurus-ui/commit/65abfc5dbd5b82df1ceca4852b8b6a4bee7c6db8))
* **userSettings:** user settings are not applied if you go to the cluster from the page with clusters [[#471](https://github.com/ytsaurus/ytsaurus-ui/issues/471)] ([134f5c1](https://github.com/ytsaurus/ytsaurus-ui/commit/134f5c17d6c0880cb6769543429e7476733d9a49))

## [1.29.0](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v1.28.1...ui-v1.29.0) (2024-04-12)


### Features

* **QueryTracker:** support validate and explain for yql queries [[#370](https://github.com/ytsaurus/ytsaurus-ui/issues/370)] ([2ba362e](https://github.com/ytsaurus/ytsaurus-ui/commit/2ba362e33cbcf3ba36443bb8e3c182b7b3617bb7))


### Bug Fixes

* **Navigation/Table:** sync width of headers with data [YTFRONT-4109] ([cfb18df](https://github.com/ytsaurus/ytsaurus-ui/commit/cfb18dfd65e4595a8bc5b4ec29037c7b8841aeb0))
* **QueryTracker:** yql query progress shows wrong stage for a query step [[#368](https://github.com/ytsaurus/ytsaurus-ui/issues/368)] ([2c0fd6c](https://github.com/ytsaurus/ytsaurus-ui/commit/2c0fd6ca5a877fb2a3d5e513f42cf98ab6e4b06e))
* **QueryTracker:** yql query steps redirect on a wrong page [[#369](https://github.com/ytsaurus/ytsaurus-ui/issues/369)] ([d5ec33b](https://github.com/ytsaurus/ytsaurus-ui/commit/d5ec33ba72d34fcff628e33f8a518f1b29c2fd41))
* **Store:** change redux toolkit configuration [YTFRONT-4115] ([891ebdc](https://github.com/ytsaurus/ytsaurus-ui/commit/891ebdc15e4aa805632db5472ace701af16d8cae))
* **table:** there  is no headers in full window mode for table preview [[#422](https://github.com/ytsaurus/ytsaurus-ui/issues/422)] ([0e82358](https://github.com/ytsaurus/ytsaurus-ui/commit/0e82358d58a3598722edaba69f28a125a07ba44c))

## [1.28.1](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v1.28.0...ui-v1.28.1) (2024-04-10)


### Bug Fixes

* **Navigation:** emojis in names [YTFRONT-4104] ([fbf8c12](https://github.com/ytsaurus/ytsaurus-ui/commit/fbf8c122a7e2a7f10774ff9a65de62a1c3a0273c))
* **Query:** clique disabled by history query [YTFRONT-4105] ([747f9e2](https://github.com/ytsaurus/ytsaurus-ui/commit/747f9e2e6bc1966bb8d05b314eb233a33d637fdd))

## [1.28.0](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v1.27.0...ui-v1.28.0) (2024-04-09)


### Features

* add redux toolkit [YTFRONT-4094] ([e750edb](https://github.com/ytsaurus/ytsaurus-ui/commit/e750edb38aac578a9d48b92a2e769641cf13534a))
* **QueryTracker:** new columns to the list of queries [[#267](https://github.com/ytsaurus/ytsaurus-ui/issues/267)] ([22d69a8](https://github.com/ytsaurus/ytsaurus-ui/commit/22d69a89cdcff82346649adcf64fb46f4cec1d66))


### Bug Fixes

* **configs:** add backward compatibility for YT_AUTH_CLUSTER_ID [[#349](https://github.com/ytsaurus/ytsaurus-ui/issues/349)] ([0deca57](https://github.com/ytsaurus/ytsaurus-ui/commit/0deca57a1a0ea3c32259ca8a83e340bd63514439))
* **Scheduling/Overview:** replace name filter with pool-selector [YTFRONT-4075] ([2865e09](https://github.com/ytsaurus/ytsaurus-ui/commit/2865e09cf3ffa91dcfc4378876b9dc881b20e2d8))
* **Scheduling:** fix for pools filter [[#460](https://github.com/ytsaurus/ytsaurus-ui/issues/460)] ([edf380d](https://github.com/ytsaurus/ytsaurus-ui/commit/edf380df6750cb3f5a2f23872dc4adee9247769d))

## [1.27.0](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v1.26.0...ui-v1.27.0) (2024-04-04)


### Features

* **Query:** add tooltip to search field qt [YTFRONT-4096] ([f5b2c7e](https://github.com/ytsaurus/ytsaurus-ui/commit/f5b2c7e8cc0000708b2407ed69dde7ce07ef4115))
* **Query:** add yql and chyt autocomplete [YTFRONT-4074] ([2e025aa](https://github.com/ytsaurus/ytsaurus-ui/commit/2e025aa8dab454e9d3a0fcc9c47967a8202d4af8))
* **Query:** page header redesign [YTFRONT-4041] ([b2d6696](https://github.com/ytsaurus/ytsaurus-ui/commit/b2d66969c46fae1bd68884298c92fda3be7183db))


### Bug Fixes

* **Bundles/Editor:** allow to edit Memory/Reserved through 'Reset to default' [YTFRONT-4098] ([2b371fc](https://github.com/ytsaurus/ytsaurus-ui/commit/2b371fc64f137f5c18a9f839ede5a95131527269))
* **Bundles:** fix request params [YTFRONT-4072] ([92fd224](https://github.com/ytsaurus/ytsaurus-ui/commit/92fd2245d1c02e9fa50e37d2b969312a98e0bad9))
* delete unnecessary column [YTFRONT-4072] ([cc800a8](https://github.com/ytsaurus/ytsaurus-ui/commit/cc800a873c94cbbdf43622e1100b1886ebd75547))
* **Navigation:** wrong path to table in notification [YTFRONT-4091] ([21d87c1](https://github.com/ytsaurus/ytsaurus-ui/commit/21d87c193c24e82891a9b7457e11b516e11f29cf))
* **Navigation:** wrong schema col width [YTFRONT-4092] ([32e80d9](https://github.com/ytsaurus/ytsaurus-ui/commit/32e80d90ca8a3bd7748ac7cec5c87e551583dabc))
* **Query:** fix progress stages view [YTFRONT-4097] ([0098222](https://github.com/ytsaurus/ytsaurus-ui/commit/00982227f7219e864ec487cc8571b7d834c1a84b))
* **Query:** fixed error text selection [YTFRONT-4089] ([be5d802](https://github.com/ytsaurus/ytsaurus-ui/commit/be5d80270163541e7a77085b8d1c02391301c685))

## [1.26.0](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v1.25.0...ui-v1.26.0) (2024-03-29)


### Features

* **System:** monitoring tab [YTFRONT-4022] ([24d1885](https://github.com/ytsaurus/ytsaurus-ui/commit/24d18859a40226347efc4475db199b526063aa21))

## [1.25.0](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v1.24.1...ui-v1.25.0) (2024-03-28)


### Features

* **ACL:** add ability to describe custom permissionFlags [YTFRONT-4073] ([17be3da](https://github.com/ytsaurus/ytsaurus-ui/commit/17be3da4a03c6f807a13216215fb724f77b6f44e))
* **Query:** progress for spyt engine [YTFRONT-3981] ([14a59b0](https://github.com/ytsaurus/ytsaurus-ui/commit/14a59b01712146e99113a27dba6a556c10f8ca69))


### Bug Fixes

* **navigation:** corrected the description change form [YTFRONT-4083] ([93ee0d1](https://github.com/ytsaurus/ytsaurus-ui/commit/93ee0d16c088e3aaebf7e71f825864ee945ba4be))

## [1.24.1](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v1.24.0...ui-v1.24.1) (2024-03-26)


### Bug Fixes

* **Query:** underline in monaco [YTFRONT-4069] ([d2bc351](https://github.com/ytsaurus/ytsaurus-ui/commit/d2bc35179fd924a2150f28f4aa2d278213592d7b))

## [1.24.0](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v1.23.1...ui-v1.24.0) (2024-03-21)


### Features

* **Accounts:** add attribute modal [YTFRONT-3829] ([0af6f85](https://github.com/ytsaurus/ytsaurus-ui/commit/0af6f85395fdbdd2b0168d360a8d213dbde920a9))

## [1.23.1](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v1.23.0...ui-v1.23.1) (2024-03-21)


### Bug Fixes

* **BundleEditorDialog:** confirm button should be clickable [YTFRONT-4076] ([e8f10da](https://github.com/ytsaurus/ytsaurus-ui/commit/e8f10daba41fb088f2d505ab30054f51531c36b8))
* request for settings is made without a cluster ([5243dc5](https://github.com/ytsaurus/ytsaurus-ui/commit/5243dc533d14576901d1749e029633b497de981e))

## [1.23.0](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v1.22.3...ui-v1.23.0) (2024-03-20)


### Features

* **Query:** new query error component [YTFRONT-4000] ([9d781f4](https://github.com/ytsaurus/ytsaurus-ui/commit/9d781f4633b57a287554b91e56ecde182e86abd4))

## [1.22.3](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v1.22.2...ui-v1.22.3) (2024-03-18)


### Bug Fixes

* **CHYT:** do not load pools while defaultPoolTree is empty [YTFRONT-3863] ([0b2e823](https://github.com/ytsaurus/ytsaurus-ui/commit/0b2e823adcc8f794fc4ec11c3951b2d444d9fb68))

## [1.22.2](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v1.22.1...ui-v1.22.2) (2024-03-18)


### Bug Fixes

* **CHYT/CreateModal:** use RangeInputPicker for 'Instances count' field [YTFRONT-3863] ([efdf7a5](https://github.com/ytsaurus/ytsaurus-ui/commit/efdf7a5b883381d1081acf3dc8fce8a28c4a077b))
* **CHYT:** default pool tree should be loaded properly [YTFRONT-3683] ([4ef42f4](https://github.com/ytsaurus/ytsaurus-ui/commit/4ef42f4597961af707ddeecd73eb36f751270e88))
* **CHYT:** minor fixes [YTFRONT-3863] ([fedd43d](https://github.com/ytsaurus/ytsaurus-ui/commit/fedd43dae9928c298da02fb60d427a91c9143245))
* **main:** Added missing used deps to package.json ([be505ec](https://github.com/ytsaurus/ytsaurus-ui/commit/be505ec0a489406a5dfda6503cbf52ad23b475f9))
* use var(--yt-font-weight) css variable ([847ba30](https://github.com/ytsaurus/ytsaurus-ui/commit/847ba308553e18507053800c888bfc5586a1815b))

## [1.22.1](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v1.22.0...ui-v1.22.1) (2024-03-17)


### Bug Fixes

* add migration description for ytAuthCluster -&gt; allowPasswordAuth [[#349](https://github.com/ytsaurus/ytsaurus-ui/issues/349)] ([d1a9b2b](https://github.com/ytsaurus/ytsaurus-ui/commit/d1a9b2b3e011ba77df2ee48bc8959530e5186ed5))

## [1.22.0](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v1.21.0...ui-v1.22.0) (2024-03-13)


### Features

* **odin:** support odin url per cluster ([959cbb9](https://github.com/ytsaurus/ytsaurus-ui/commit/959cbb9fcc0c4685f36eaa80748895593da94022))

## [1.21.0](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v1.20.0...ui-v1.21.0) (2024-03-12)


### Features

* **Navigation:** add new node types: rootstock, scion [YTFRONT-4046] ([1b5bdca](https://github.com/ytsaurus/ytsaurus-ui/commit/1b5bdcaa9f5ebc66fb2d10fae00706cd37eb0c32))


### Bug Fixes

* **Operation/JobsMonitor:** better condition of visibility [YTFRONT-3940] ([caedb0c](https://github.com/ytsaurus/ytsaurus-ui/commit/caedb0c27c7464b734b55808fd1dbb074104d286))

## [1.20.0](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v1.19.0...ui-v1.20.0) (2024-03-06)


### Features

* **Navigation:** added quick header editing [YTFRONT-3783] ([514120a](https://github.com/ytsaurus/ytsaurus-ui/commit/514120a01f48cad3ea3a577a47a12b5aafaa4606))

## [1.19.0](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v1.18.1...ui-v1.19.0) (2024-03-04)


### Features

* **System:** add //sys/[@master](https://github.com/master)_alerts [YTFRONT-3960] ([7b2503d](https://github.com/ytsaurus/ytsaurus-ui/commit/7b2503d9c2aa8c2fde4c805d8e91589bafc80d6e))


### Bug Fixes

* **Bundles/BundleEditor:** better validation of resources [YTFRONT-4035] ([349ac37](https://github.com/ytsaurus/ytsaurus-ui/commit/349ac37a2163b1c8712101cd19377a62b5df78a9))
* **Bundles/MetaTable:** add icons for state with details [YTFRONT-4038] ([96f7533](https://github.com/ytsaurus/ytsaurus-ui/commit/96f753355e3076c490591bd388c1561f34849ace))
* **Navigation:** hide unnecessary error `[code cancelled]` [YTFRONT-4034] ([e31cc61](https://github.com/ytsaurus/ytsaurus-ui/commit/e31cc61f57c6e89d6edf0627873c3f9d17f4d995))
* **Scheduling/Details:** for 'Cannot read properties of undefined (reading 'cpu')' [YTFRONT-4042] ([d3be924](https://github.com/ytsaurus/ytsaurus-ui/commit/d3be924172b78b2cd8b371d5df9adf02a6cf9a45))
* **System/Masters:** do not load hydra for discovery servers [YTFRONT-4043] ([d2513ff](https://github.com/ytsaurus/ytsaurus-ui/commit/d2513ff255d287e46540b5156bb3cc47236fc7df))

## [1.18.1](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v1.18.0...ui-v1.18.1) (2024-02-27)


### Bug Fixes

* **Scheduling:** do not use '.../orchid/scheduler/scheduling_info_per_pool_tree' [YTFRONT-3937] ([a5a93bb](https://github.com/ytsaurus/ytsaurus-ui/commit/a5a93bb5d61a8814c80c7f512ae7a4aaa4bcd764))

## [1.18.0](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v1.17.1...ui-v1.18.0) (2024-02-27)


### Features

* **Navigation:** added the ability to edit a document [YTFRONT-3921] ([98b6dba](https://github.com/ytsaurus/ytsaurus-ui/commit/98b6dba191c010b34b282098866ea5dc59ee724c))

## [1.17.1](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v1.17.0...ui-v1.17.1) (2024-02-27)


### Bug Fixes

* **Queries:** use POST-data for parameters of startQuery-command [YTFRONT-4023] ([d03c8e0](https://github.com/ytsaurus/ytsaurus-ui/commit/d03c8e0f65800a8332dac4165c43efe46a868885))
* scheduling broken aggregation [YTFRONT-4031] ([d460549](https://github.com/ytsaurus/ytsaurus-ui/commit/d460549d4073572dff855a962b8e7c1085566415))

## [1.17.0](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v1.16.1...ui-v1.17.0) (2024-02-16)


### Features

* add multi-cluster passwd-auth [[#349](https://github.com/ytsaurus/ytsaurus-ui/issues/349)] ([ddf4617](https://github.com/ytsaurus/ytsaurus-ui/commit/ddf4617387ab8f88f901f268d72e17eff66d0f57))
* show authorized clusters [[#349](https://github.com/ytsaurus/ytsaurus-ui/issues/349)] ([d582bfc](https://github.com/ytsaurus/ytsaurus-ui/commit/d582bfcd490b8199e5713f24f7970697ba0513dd))

## [1.16.1](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v1.16.0...ui-v1.16.1) (2024-02-14)


### Bug Fixes

* minor fix for ts-error after rebase ([e5689aa](https://github.com/ytsaurus/ytsaurus-ui/commit/e5689aa02acb9e173b2689af100e76ced0b4e821))

## [1.16.0](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v1.15.3...ui-v1.16.0) (2024-02-14)


### Features

* **Operation/Details:** better live preview [YTFRONT-3956] ([0b1ffb9](https://github.com/ytsaurus/ytsaurus-ui/commit/0b1ffb97fbbc52c24836802c23200661b0ab344e))
* **query-tracker:** query aco management [[#246](https://github.com/ytsaurus/ytsaurus-ui/issues/246)] ([8b79661](https://github.com/ytsaurus/ytsaurus-ui/commit/8b79661cabc4a949687c407e4abcc08762bd776f))

## [1.15.3](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v1.15.2...ui-v1.15.3) (2024-02-12)


### Bug Fixes

* **Operation/DataFlow:** better column name for chunk_count [YTFRONT-3924] ([7477c48](https://github.com/ytsaurus/ytsaurus-ui/commit/7477c4837815b3b96923b81e5e66b32233e9346b))

## [1.15.2](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v1.15.1...ui-v1.15.2) (2024-02-09)


### Bug Fixes

* **layout:** the left menu disappears on long tables [[#225](https://github.com/ytsaurus/ytsaurus-ui/issues/225)] ([d54448a](https://github.com/ytsaurus/ytsaurus-ui/commit/d54448ab86c6ae888128ef485ff03d565331c2b2))
* **Navigation/MapNode:** do not wrap escaped characters ([60c0893](https://github.com/ytsaurus/ytsaurus-ui/commit/60c089364290fffae0d3ea88476c8a2cc6c52e40))
* **OperationsList:** fix for 'unexpected error' after aborting an operation [YTFRONT-4013] ([7847e91](https://github.com/ytsaurus/ytsaurus-ui/commit/7847e91ec931654a97b23d0e9c09972cb91ce61a))
* **Scheduling:** allow to create pools with &lt;Root&gt; parent [[#274](https://github.com/ytsaurus/ytsaurus-ui/issues/274)] ([91aa32e](https://github.com/ytsaurus/ytsaurus-ui/commit/91aa32e45aee7700fd55b12c2a0e77011fdb40a7))
* **table:** the left menu disappears on long tables [[#225](https://github.com/ytsaurus/ytsaurus-ui/issues/225)] ([4c4b015](https://github.com/ytsaurus/ytsaurus-ui/commit/4c4b015c1c327a9fc26dce39ca373fff3a4d709f))

## [1.15.1](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v1.15.0...ui-v1.15.1) (2024-02-05)


### Bug Fixes

* **settings:** read settings from localStorage [[#341](https://github.com/ytsaurus/ytsaurus-ui/issues/341)] ([ea6ddbd](https://github.com/ytsaurus/ytsaurus-ui/commit/ea6ddbd7a2d8f8a7ff8b0ab9c2eba7af4acfe3cb))

## [1.15.0](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v1.14.3...ui-v1.15.0) (2024-02-05)


### Features

* add UISettings.reportBugUrl [[#336](https://github.com/ytsaurus/ytsaurus-ui/issues/336)] ([e86ccb2](https://github.com/ytsaurus/ytsaurus-ui/commit/e86ccb2865918a7b62c7857a1079c2248b855286))


### Bug Fixes

* **Operations/Details:** minor css fix [YTFRONT-3518] ([91d9b01](https://github.com/ytsaurus/ytsaurus-ui/commit/91d9b0172dd8de0c1d610bc9eb1ca8d2117b1dd6))
* **Scheduling/PoolEditor:** correct value for fifo_sort_parameters [YTFRONT-3957] ([34d5cdb](https://github.com/ytsaurus/ytsaurus-ui/commit/34d5cdb672b0eeadce80f10d1f828f1579e326ac))
* **SupportForm:** rework api of makeSupportContent [YTFRONT-3994] ([a563179](https://github.com/ytsaurus/ytsaurus-ui/commit/a563179b6ce5d85e79e24a58a4aa425b5708b281))

## [1.14.3](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v1.14.2...ui-v1.14.3) (2024-02-01)


### Bug Fixes

* do not wait for checkIsDeveloper response [YTFRONT-3862] ([4f0470b](https://github.com/ytsaurus/ytsaurus-ui/commit/4f0470b8a8a0fdd2beae8f911ab7666c0cdc5bbe))
* **timestampProvider:** update the default value when `clock_cell` is missing [YTFRONT-3946] ([8f44e05](https://github.com/ytsaurus/ytsaurus-ui/commit/8f44e05e1b6d655eab4fecdb1112647466625511))

## [1.14.2](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v1.14.1...ui-v1.14.2) (2024-01-30)


### Bug Fixes

* better error message for executeBatch ([1d96e53](https://github.com/ytsaurus/ytsaurus-ui/commit/1d96e539ffa3f2a3a690d3b3b081e8dea6b3a2db))
* update @ytsaurus/javascript v0.6.1 ([935cee4](https://github.com/ytsaurus/ytsaurus-ui/commit/935cee4ea253b13c8246c1ae740bf2833fb706f0))

## [1.14.1](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v1.14.0...ui-v1.14.1) (2024-01-30)


### Bug Fixes

* **Components/Node:** handle 'offline' nodes properly [YTFRONT-3993] ([53c4d16](https://github.com/ytsaurus/ytsaurus-ui/commit/53c4d169094d441df24b1c0b00210e186d1623af))
* **Navigation/Table/Merge:** update @ytsaurus/javascript-wrapper [YTFRONT-3953] ([f5b4128](https://github.com/ytsaurus/ytsaurus-ui/commit/f5b412879a8dffc453e2530878600f4723a95b0c))
* **Operations:** cancle requests properly [YTFRONT-3996] ([d3afc0f](https://github.com/ytsaurus/ytsaurus-ui/commit/d3afc0f4945e2679918f30061359fe70112b34cf))
* **xss:** fix an xss [YTFRONT-4004] ([7819f8a](https://github.com/ytsaurus/ytsaurus-ui/commit/7819f8a4c54c379d7e8300bbcc56b8192abb3e41))

## [1.14.0](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v1.13.1...ui-v1.14.0) (2024-01-29)


### Features

* **Scheduling:** load data only for visible pools [YTFRONT-3862] ([056f431](https://github.com/ytsaurus/ytsaurus-ui/commit/056f4319b034173728564cdb4f97f067665ff5af))


### Bug Fixes

* **Components/Node:** 'offline' nodes should be handled properly [YTFRONT-3993] ([eb34e49](https://github.com/ytsaurus/ytsaurus-ui/commit/eb34e49e9ec12506f79d99a3cc32ce4ee1949f78))
* **Scheduling:** use pool_trees instead of scheduling_info_per_pool_tree [YTFRONT-3937] ([f745a67](https://github.com/ytsaurus/ytsaurus-ui/commit/f745a67285b1f649debc061a5938425626a07931))
* **support.js:** get rid of _DEV_PATCH_NUMBER [YTFRONT-3862] ([35caa4b](https://github.com/ytsaurus/ytsaurus-ui/commit/35caa4b7305a52f7bc8aa75d494e2fc109172756))
* **support:** scheduler, master should be checked properly [YTFRONT-3862] ([64e5583](https://github.com/ytsaurus/ytsaurus-ui/commit/64e5583485a48d5565964e8be380a68bf96b8910))

## [1.13.1](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v1.13.0...ui-v1.13.1) (2024-01-29)


### Bug Fixes

* receive the correct cell_tag [YTFRONT-3946] ([dee458b](https://github.com/ytsaurus/ytsaurus-ui/commit/dee458b1aa052e0d56ae90b2b405e4b662bed2ad))

## [1.13.0](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v1.12.2...ui-v1.13.0) (2024-01-26)


### Features

* implement an OAuth authorize [YTFRONT-3903] ([38fcda4](https://github.com/ytsaurus/ytsaurus-ui/commit/38fcda40dacbd12be0deba573b9fc32f17d445b5))

## [1.12.2](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v1.12.1...ui-v1.12.2) (2024-01-23)


### Bug Fixes

* add bundle resources validation [YTFRONT-3931] ([72b17d3](https://github.com/ytsaurus/ytsaurus-ui/commit/72b17d3160dd557c3b3cb4b7c311c4f348be237e))
* nodejs error during logout [[#292](https://github.com/ytsaurus/ytsaurus-ui/issues/292)] ([3e64d2c](https://github.com/ytsaurus/ytsaurus-ui/commit/3e64d2cef1760f7b40b866e806fc6f835d007cbd))

## [1.12.1](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v1.12.0...ui-v1.12.1) (2024-01-22)


### Bug Fixes

* **Queries/Results:** synchronize table header when resizing [[#294](https://github.com/ytsaurus/ytsaurus-ui/issues/294)] ([f625984](https://github.com/ytsaurus/ytsaurus-ui/commit/f6259848aa7159474ce929cc963f065383e3382b))

## [1.12.0](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v1.11.2...ui-v1.12.0) (2024-01-22)


### Features

* added a new query button [[#238](https://github.com/ytsaurus/ytsaurus-ui/issues/238)] ([b66fa31](https://github.com/ytsaurus/ytsaurus-ui/commit/b66fa31927187debe8361e7866f33dc62b211026))
* **Components/Node:** add 'Unrecognized options' tab [YTFRONT-3936] ([520916b](https://github.com/ytsaurus/ytsaurus-ui/commit/520916baddf345ff1c5f082dd6be57e4a3514fdb))

## [1.11.2](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v1.11.1...ui-v1.11.2) (2024-01-16)


### Bug Fixes

* **CHYT:** do not display CHYT-page when chyt_controller_base_url is empty [YTFRONT-3863] ([cb66484](https://github.com/ytsaurus/ytsaurus-ui/commit/cb664842ffdd6ae56461afdc85340ba6c9fbd602))

## [1.11.1](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v1.11.0...ui-v1.11.1) (2024-01-11)


### Bug Fixes

* **CHYT:** minor fixes [YTFRONT-3863] ([b71db09](https://github.com/ytsaurus/ytsaurus-ui/commit/b71db097642001cf21adc67493da0763443fa931))

## [1.11.0](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v1.10.0...ui-v1.11.0) (2024-01-09)


### Features

* **CHYT:** add CHYT page with list of cliques [YTFRONT-3683] ([de0c74a](https://github.com/ytsaurus/ytsaurus-ui/commit/de0c74a368ab37b5aa953e965efab8d8a4d9b2e1))
* update @gravity-ui/dialog-fields v4.3.0 ([5f61464](https://github.com/ytsaurus/ytsaurus-ui/commit/5f614647b3c70084d682cbf233df727107425eea))


### Bug Fixes

* **PoolSuggestControl:** load all pools ([d56d0df](https://github.com/ytsaurus/ytsaurus-ui/commit/d56d0df20f1e39dd93074283ec5bdc9edc2622e0))

## [1.10.0](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v1.9.0...ui-v1.10.0) (2023-12-22)


### Features

* **Components/Nods**: display location ids on data node table [[#204](https://github.com/ytsaurus/ytsaurus-ui/issues/204)] ([29ff849](https://github.com/ytsaurus/ytsaurus-ui/commit/29ff849f75af54056b471ea0546cce96b9f7037d))
* **Quereis**: prevent user from closing the browser window with unsaved query text [[#226](https://github.com/ytsaurus/ytsaurus-ui/issues/226)] ([e3d12e8](https://github.com/ytsaurus/ytsaurus-ui/commit/e3d12e8e9c65639f6892b5be1ab9031581400c11))
* **query-tracker:** hide query history sidebar [[#211](https://github.com/ytsaurus/ytsaurus-ui/issues/211)] ([5602087](https://github.com/ytsaurus/ytsaurus-ui/commit/5602087899f0bf07eeb20312ee31cab66a055719))


### Bug Fixes

* **Queries:** do not display empty progress tab [YTFRONT-3952] ([858b11f](https://github.com/ytsaurus/ytsaurus-ui/commit/858b11f1ba262456953a75121e430f686c6a6e36))
* **Queries**: render complex types in navigation [[#229](https://github.com/ytsaurus/ytsaurus-ui/issues/229)] ([1bef4ae](https://github.com/ytsaurus/ytsaurus-ui/commit/1bef4ae7493dfed7f30bb2a64ac81d65e189bb7c))

## [1.9.0](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v1.8.0...ui-v1.9.0) (2023-12-20)


### Features

* add SettingMenuItem.props.useSwitch ([c3f5154](https://github.com/ytsaurus/ytsaurus-ui/commit/c3f5154212c4d30b81fed8910996be686444e95b))

## [1.8.0](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v1.7.3...ui-v1.8.0) (2023-12-19)


### Features

* update @gravity-ui/navigation v1.8.0 ([e5530e1](https://github.com/ytsaurus/ytsaurus-ui/commit/e5530e16155d9bf124acf41d825093e92206462a))

## [1.7.3](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v1.7.2...ui-v1.7.3) (2023-12-18)


### Bug Fixes

* **main.js:** extract MonacoEditor to a separate chunk [YTFRONT-3814] ([2492c78](https://github.com/ytsaurus/ytsaurus-ui/commit/2492c78a187e1ba5be76b8254ffb5c2927b75c9d))

## [1.7.2](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v1.7.1...ui-v1.7.2) (2023-12-13)


### Bug Fixes

* sync packages/ui/package-lock.json ([381a97f](https://github.com/ytsaurus/ytsaurus-ui/commit/381a97f8ce0fde3ed85a316b133b0045d55af51e))

## [1.7.0](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v1.6.0...ui-v1.7.0) (2023-12-13)


### Features

* **query-tracker:** added file attachments to queries [[#221](https://github.com/ytsaurus/ytsaurus-ui/issues/221)] ([16d4138](https://github.com/ytsaurus/ytsaurus-ui/commit/16d41384621d368e83b34bfc5d1de933afc7d7b9))


### Bug Fixes

* **Components/SetupModal:** fix Racks filter [YTFRONT-3944] ([0662e07](https://github.com/ytsaurus/ytsaurus-ui/commit/0662e07355402c5cbed8ffc3dd39997397532ea0))
* **RemoteCopy:** get rid of erasure_codec, compression_codec for a while [YTFRONT-3935] ([8518c96](https://github.com/ytsaurus/ytsaurus-ui/commit/8518c968200e92f6fe7242635515435fb70b1505))
* **Scheduling:** tree selector should be filterable [YTFRONT-3948] ([3102f5e](https://github.com/ytsaurus/ytsaurus-ui/commit/3102f5ea9a04d03f75420999dbbeb776e481afbf))
* **System/Chunks:** i.get is not a function [YTFRONT-3943] ([8c6a9e5](https://github.com/ytsaurus/ytsaurus-ui/commit/8c6a9e59f5f9ca31ab9f8fd7b881c847d130bd8a))

## [1.6.0](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v1.5.2...ui-v1.6.0) (2023-12-08)


### Features

* **Table/Schema:** add external title column [YTFRONT-3939] ([074f638](https://github.com/ytsaurus/ytsaurus-ui/commit/074f6386e104989531b0d2432c581f5296f3b60d))


### Bug Fixes

* **query-tracker:** dynamic system columns' content is now displayed correctly [[#192](https://github.com/ytsaurus/ytsaurus-ui/issues/192)] ([271b1f6](https://github.com/ytsaurus/ytsaurus-ui/commit/271b1f6660627a5c10fbae1a60145e03c111acc6))

## [1.5.2](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v1.5.1...ui-v1.5.2) (2023-12-05)


### Bug Fixes

* pagination callback not rerendering when switching queries ([99db6af](https://github.com/ytsaurus/ytsaurus-ui/commit/99db6af890cbce0213223d605fe604e5ea64b19c))
* **query tracker:** row count and truncated flag are now displayed above results table [[#210](https://github.com/ytsaurus/ytsaurus-ui/issues/210)] ([fe200b9](https://github.com/ytsaurus/ytsaurus-ui/commit/fe200b9a2f964f484aa0e820ea9c68c7b12d8d32))
* **query-tracker:** Query results with more than 50 columns are not shown properly [#208](https://github.com/ytsaurus/ytsaurus-ui/issues/208) ([8e2ddc7](https://github.com/ytsaurus/ytsaurus-ui/commit/8e2ddc77b3b2691a346a3bd22be8b5d2558b61f5))

## [1.5.1](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v1.5.0...ui-v1.5.1) (2023-12-01)


### Bug Fixes

* readme Development section improve ([c06921b](https://github.com/ytsaurus/ytsaurus-ui/commit/c06921ba3956cd861411927c025607884d991f8b))

## [1.5.0](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v1.4.0...ui-v1.5.0) (2023-12-01)


### Features

* **QT:** add query list visible toggle button ([1ba0ccd](https://github.com/ytsaurus/ytsaurus-ui/commit/1ba0ccdc2c7e095c86660f472f72eee62210c710))
* **QT:** Progress and timeline component [YTFRONT-3840] ([a092966](https://github.com/ytsaurus/ytsaurus-ui/commit/a092966199317abc8a637569bd28e9249ab8c5ac))


### Bug Fixes

* **QT:** fallback Loader center alignment ([3c1ad2b](https://github.com/ytsaurus/ytsaurus-ui/commit/3c1ad2bb88ca0c489de4d0afc511c28650b2d62a))
* **QT:** yql stage setting should not affect other engines requests ([1f2b253](https://github.com/ytsaurus/ytsaurus-ui/commit/1f2b253d7305ea870f27ed5cc28edfffe0fdeb43))

## [1.4.0](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v1.3.1...ui-v1.4.0) (2023-11-17)


### Features

* **Updater:** handle 'visibilitychange' events of window.document [YTFRONT-3835] ([76fe005](https://github.com/ytsaurus/ytsaurus-ui/commit/76fe0050e2d0c0c1fe969336cbfe57ba6c70432a))

## [1.3.1](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v1.3.0...ui-v1.3.1) (2023-11-16)


### Bug Fixes

* **Accounts,Bundles:** better defaults for accounting settings [YTFRONT-3891] ([8a79e4b](https://github.com/ytsaurus/ytsaurus-ui/commit/8a79e4b0bc1c2156e0dd10646cb069bd4b1e1dd0))
* **Accounts:** do not use cache after editing [YTFRONT-3920] ([0ab91a0](https://github.com/ytsaurus/ytsaurus-ui/commit/0ab91a0bdc80ef08c51d79894b4121afa6f9435e))
* **Jobs:** do not use uppercase for job-type [YTFRONT-3917] ([1f4e1bf](https://github.com/ytsaurus/ytsaurus-ui/commit/1f4e1bf45082c1e77a7a5f989b080e08196f069f))
* **Navigation/Consumer:** fix for Target Queue selector [YTFRONT-3910] ([5358127](https://github.com/ytsaurus/ytsaurus-ui/commit/5358127d57339867b2124239eeb48ac8ca47555d))
* **Navigation/MapNode:** truncate long names with ellipsis [YTFRONT-3913] ([67eddcb](https://github.com/ytsaurus/ytsaurus-ui/commit/67eddcb5d1a2529068610b7fdb7e60ab17506ed1))
* **Odin:** minor layout fix [YTFRONT-3909] ([8012884](https://github.com/ytsaurus/ytsaurus-ui/commit/8012884b26849902a19358937893695023c42b26))
* **reShortNameFromAddress:** better default [YTFRONT-3861] ([39f07ad](https://github.com/ytsaurus/ytsaurus-ui/commit/39f07ad0b9b98863033b2beccd3c6f8798a19006))
* **Scheduling:** fix for pool-tree selector [YTFRONT-3918] ([3fb86bb](https://github.com/ytsaurus/ytsaurus-ui/commit/3fb86bb7f192afda9a5103184f65403117a75d6b))

## [1.3.0](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v1.2.0...ui-v1.3.0) (2023-11-10)


### Features

* add UIFactory.getAllowedExperimentalPages method [YTFRONT-3912] ([fca2666](https://github.com/ytsaurus/ytsaurus-ui/commit/fca266621a7731db5dfe979efde095d0d2c6c4d5))

## [1.2.0](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v1.1.2...ui-v1.2.0) (2023-11-10)


### Features

* **QT:** add Progress component [YTFRONT-3840] ([69a787a](https://github.com/ytsaurus/ytsaurus-ui/commit/69a787a25d67f14d3a8687d65c35eb71f654a295))


### Bug Fixes

* **QT:** fix result tabs switching when polling [YTFRONT-3840] ([b304c2b](https://github.com/ytsaurus/ytsaurus-ui/commit/b304c2bc96d4018a133fea41e3a5f2bfb37d413a))
* **QT:** Plan add table and operation urls to nodes [YTFRONT-3840] ([080acbc](https://github.com/ytsaurus/ytsaurus-ui/commit/080acbc879c34e3c979dc81c61b36a488ddff18b))

## [1.1.2](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v1.1.1...ui-v1.1.2) (2023-11-09)


### Bug Fixes

* babel config app-builder conflict ([e435a25](https://github.com/ytsaurus/ytsaurus-ui/commit/e435a259a040fbf09490873210cca5ad37ff3e9d))

## [1.1.1](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v1.1.0...ui-v1.1.1) (2023-10-27)


### Bug Fixes

* allow column groups create form only for map_nodes [YTFRONT-3901] ([32a8bf0](https://github.com/ytsaurus/ytsaurus-ui/commit/32a8bf0b043881f574d60839c328bb65806c0a01))
* **GroupsPage:** get rid of updater from GroupsPage [YTFRONT-3835] ([548798b](https://github.com/ytsaurus/ytsaurus-ui/commit/548798ba7fc413d7e767d54e20aa89f5c276406b))
* **Users:** get rid of updater from UsersPage [YTFRONT-3835] ([78cd8e8](https://github.com/ytsaurus/ytsaurus-ui/commit/78cd8e849907a6c8bab7b9e2714844e51c8861da))

## [1.1.0](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v1.0.2...ui-v1.1.0) (2023-10-20)


### Features

* **ClusterAppearance:** add ability to redefine cluster icons [YTFRONT-3879] ([61e27f7](https://github.com/ytsaurus/ytsaurus-ui/commit/61e27f71390f08c101dbfd0df1650ee27a4014c2))
* **ClusterConfig:** add 'externalProxy' field [YTFRONT-3890] ([c172097](https://github.com/ytsaurus/ytsaurus-ui/commit/c172097b4324fc84ec720e3ba786f0baa6b5f5d2))
* **Compoents/Nodes:** add 'Flavors' column [YTFRONT-3886] ([0256361](https://github.com/ytsaurus/ytsaurus-ui/commit/0256361235bf0b541f9cba4088408af97c27ede1))
* **UISettings:** add reShortNameFromAddress [YTFRONT-3861] ([fa433ba](https://github.com/ytsaurus/ytsaurus-ui/commit/fa433baaa65fa3debe895630e5727c8015d3d6f8))
* **unipika:** add UISettings.hidReferrerUrl (+e2e) [YTFRONT-3875] ([2ee7524](https://github.com/ytsaurus/ytsaurus-ui/commit/2ee75245d638694e5d61dccfc56e394960fddd81))
* **unipika:** add UISettings.reUnipikaAllowTaggedSources [YTFRONT-3875] ([6039c30](https://github.com/ytsaurus/ytsaurus-ui/commit/6039c3081c2d135ed45c2e330fec4cad1d3727b7))


### Bug Fixes

* **ACL:** unrecognized roles should be highlighted [YTFRONT-3885] ([de284ca](https://github.com/ytsaurus/ytsaurus-ui/commit/de284ca31d4c1ccf0e7c79eb3263bb61a2197b22))
* **BundleEditorDialog:** key_filter_block_cache should affect value of 'Free' memory [YTFRONT-3825] ([2ffc449](https://github.com/ytsaurus/ytsaurus-ui/commit/2ffc44916afe804fd1c5c89727eb2d0ffb78f3db))
* **Components/Nodes:** User/system tags should not be wider than its table cell ([0562e48](https://github.com/ytsaurus/ytsaurus-ui/commit/0562e48a0e7600bcc974dbfce9dd682a0b051c1c))
* **controllers/home:** get rid of 'Strict-Transport-Security' header [YTFRONT-3896] ([1fd14b0](https://github.com/ytsaurus/ytsaurus-ui/commit/1fd14b0b3ab76f193730c2909c150dfeaa5e2e19))
* **Markdown:** YFM should not duplicate headers [YTFRONT-3897] ([cc92e5b](https://github.com/ytsaurus/ytsaurus-ui/commit/cc92e5bcd688aaa601e3cc4bdfe31f21549efefc))

## [1.0.2](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v1.0.1...ui-v1.0.2) (2023-10-09)


### Bug Fixes

* update @gravity-ui/charkit v4.7.2, @gravity-ui/yagr v3.10.4 ([e647df2](https://github.com/ytsaurus/ytsaurus-ui/commit/e647df2cb980ae60f73afe7cbefd6bd1478f6e38))

## [1.0.1](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v1.0.0...ui-v1.0.1) (2023-10-09)


### Bug Fixes

* try to rerun release ([ebcb80f](https://github.com/ytsaurus/ytsaurus-ui/commit/ebcb80f09df5a8ddd479f295dc701c01558748a3))

## [1.0.0](https://github.com/ytsaurus/ytsaurus-ui/compare/ui-v0.23.0...ui-v1.0.0) (2023-10-09)


### ⚠ BREAKING CHANGES 

* update @gravity-ui/uikit v5

### Features

* update @gravity-ui/uikit v5 ([1c89981](https://github.com/ytsaurus/ytsaurus-ui/commit/1c8998151fc8053bdbb4486359b6c53b53476dc3))

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
