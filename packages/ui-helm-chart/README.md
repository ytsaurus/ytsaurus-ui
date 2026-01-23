## YTsaurus UI helm chart

## Using with [ytop-chart](https://github.com/ytsaurus/ytsaurus-k8s-operator/pkgs/container/ytop-chart)

Follow all required steps to [start the YTsaurus cluster](https://ytsaurus.tech/docs/en/overview/try-yt#starting-ytsaurus-cluster1). Then install the chart:

```bash
helm upgrade --install ytsaurus-ui oci://ghcr.io/ytsaurus/ytsaurus-ui-chart
```

## Using with a custom cluster

### Pre-requirements

The instructions below describe how to start the YTsaurus UI from the helm chart. You are supposed to have already:

- configured the `kubectl` cli-tool (for example, use [minikube](https://minikube.sigs.k8s.io/docs/start/)),
- started your YT-cluster and know the hostname of `http_proxy`,
- prepared a special robot-user for the YTsaurus UI and ready to provide its token (see the [Token management](https://ytsaurus.tech/docs/user-guide/storage/auth) section).

### Quick start

By default, the chart expects existence of `yt-ui-secret` with the `yt-interface-secret.json` key. The secret can be created by the following commands:

```bash
read -sp "TOKEN: " TOKEN ; echo '{"oauthToken":"'$TOKEN'"}' > tmp.json
kubectl create secret generic yt-ui-secret --from-literal="yt-interface-secret.json=$(cat tmp.json)" && rm tmp.json
```

Also, you have to provide a description of your cluster:

```bash
read -p "Cluster name: " id_; \
    read -p "http_proxy hostname: " proxy_; \
    read -p "Use https [true/false]: " secure_; \
    read -p "NODE_TLS_REJECT_UNAUTHORIZED [1/0]: " tlsrej_; (
tee values.yaml << _EOF
ui:
  env:
    - name: NODE_TLS_REJECT_UNAUTHORIZED
      value: "$tlsrej_"
    - name: ALLOW_PASSWORD_AUTH
      value: "1"
  clusterConfig:
    clusters:
      - authentication: basic
        id: $id_
        proxy: $proxy_
        description: My first YTsaurus. Handle with care.
        environment: testing
        group: My YTsaurus clusters
        name: my cluster
        primaryMaster:
          cellTag: 1
        secure: $secure_
        theme: lavander
_EOF
)
```

Then you are ready to install or upgrade the chart:

```bash
helm upgrade --install yt-ui oci://ghcr.io/ytsaurus/ytsaurus-ui-chart \
    -f values.yaml

# Run specific version of UI (all versions: https://github.com/ytsaurus/ytsaurus-ui/pkgs/container/ui)
helm upgrade --install yt-ui oci://ghcr.io/ytsaurus/ytsaurus-ui-chart \
    -f values.yaml \
    --set ui.image.tag=1.60.1
```

You may want to add port-forwarding to open the YTsaurus UI in your browser:

```bash
kubectl port-forward deployment/yt-ui-ytsaurus-ui-chart 8080:80
```
