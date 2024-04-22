## Custom ytsaurus-ui build template

This is a demonstration of a way to build your own custom version of `@ytsaurus/ui`.
It proposes one of possible approaches to build your own version of UI without creating a fork of repository `ytsaurus/ytsaurus-ui` repository, it is supposed that you want your own separate repository with code specific for your installation.

#### How to use

```bash
# Prepare your repository
$ mkdir -p ~/github && cd ~/github && git clone https://github.com/ytsaurus/ytsaurus-ui.git
$ cp -r ~/github/ytsaurus-ui/packages/custom-ytsaurus-ui.example ~/github/my-ytsaurus-ui
$ cd ~/github/my-ytsaurus-ui && git init # && git remote set-url ...
$ cd ~/github/my-ytsaurus-ui && ./scripts/init-links.sh ~/github/ytsaurus-ui

# Use for development
$ cd ~/github/my-ytsaurus-ui && npm ci && npm run dev

# Use for build
$ cd ~/github/my-ytsaurus-ui && npm ci && npm run build
```

#### How to deploy

You can use configuration files for nginx from `~/github/ytsaurus-ui/packages/ui`.
