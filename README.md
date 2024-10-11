## YTsaurus platform UI

The repository contains code related to UI for [YTsaurus platform](https://ytsaurus.tech).

### Description

- [packages/ui](https://github.com/ytsaurus/ytsaurus-ui/tree/main/packages/ui) - UI code for YTsaurus platform [CHANGELOG](https://github.com/ytsaurus/ytsaurus-ui/tree/main/packages/ui/CHANGELOG.md)
- [packages/ui-helm-chart](https://github.com/ytsaurus/ytsaurus-ui/tree/main/packages/ui-helm-chart) - UI code for YTsaurus platform [CHANGELOG](https://github.com/ytsaurus/ytsaurus-ui/tree/main/packages/ui-helm-chart/CHANGELOG.md)
- [packages/interface-helpers](https://github.com/ytsaurus/ytsaurus-ui/tree/main/packages/interface-helpers) - library contains some helpers for UI [CHANGELOG](https://github.com/ytsaurus/ytsaurus-ui/tree/main/packages/interface-helpers/CHANGELOG.md)
- [packages/javascript-wrapper](https://github.com/ytsaurus/ytsaurus-ui/tree/main/packages/javascript-wrapper) - API library to communicate with YTsaurus platform backends [CHANGELOG](https://github.com/ytsaurus/ytsaurus-ui/tree/main/packages/javascript-wrapper/CHANGELOG.md)

### How to contribute (some notices)

- we prefer `rebases` instead of `squashes` each commit should represent a small logically finished change of code
- use interactive rebase to add changes to your PRs
- all the commits should have a title that corresponds to [convetional commits](https://www.conventionalcommits.org/en/v1.0.0/)
- to release new version of a changed package your PR should contain at least one `fix`/`feat`/`BREAKING_CHANGES` commit
- CHANGELOG.md files are automatically generated from titles of `fix`/`feat`/`BREAKING_CHANGES` commits, so they should have short clear descriptions
