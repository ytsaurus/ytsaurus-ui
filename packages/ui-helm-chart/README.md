## YTsaurus UI helm chart

## Using with [ytop-chart](https://github.com/ytsaurus/ytsaurus-k8s-operator/pkgs/container/ytop-chart)

See [the documentation](https://ytsaurus.tech/docs/en/overview/try-yt#installing-the-operator1)

## Using with custom cluster

### Prerequirements 

The instructions belows describe how to start YT UI from the helm cahrt.
It is supposed you have already:
- configured `kubectl` cli-tool (for example use [`minikube`](https://minikube.sigs.k8s.io/docs/start/))
- started your YT-cluster and knows hostname of http_proxy
- prepared a special robot-user for YT UI and ready to provide its token (see [Token management](https://ytsaurus.tech/docs/user-guide/storage/auth))

### Quick start

By default the chart expects existense of `yt-ui-secret` with `yt-interface-secret.json` key. The secret might be created by the commands bellow:

```bash
read -sp "TOKEN: " TOKEN ; echo '{"oauthToken":"'$TOKEN'"}' > tmp.json
kubectl create secret generic yt-ui-secret --from-literal="yt-interface-secret.json=$(cat tmp.json)" && rm tmp.json
```

Also you have to provide description of your cluster:
```bash
read -p "Cluster id: " id_; read -p "Proxy: " proxy_; read -p "Use https [true/false]: " secure_; read -p "NODE_TLS_REJECT_UNAUTHORIZED [1/0]: " tlsrej_; (
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

helm upgrade --install yt-ui github/ytsaurus-ui/packages/ui-helm-chart/ -f values.yaml
# or run specific version of UI (all versions: https://github.com/ytsaurus/ytsaurus-ui/pkgs/container/ui)
helm upgrade --install yt-ui github/ytsaurus-ui/packages/ui-helm-chart/ -f values.yaml --set ui.image.tag=1.60.1
```

You may want to add port-forwarding to open it in your browser:
```bash
kubectl port-forward deployment/yt-ui-ytsaurus-ui-chart 8080:80
```