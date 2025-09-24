useStop=0
read -p "Do you want to try to stop running containers? [yN]: " needToStop
if [ "${needToStop}" = "y" -o "${needToStop}" = "Y" ]; then
  useStop=1
fi

read -p "Proxy host [$(hostname)]: " proxyHost
if [ -z "$proxyHost" ]; then
  proxyHost=$(hostname)
fi

read -p "Proxy port [8000]: " proxyPort
if [ -z "$proxyPort" ]; then
  proxyPort=8000
fi

export APP_ENV=local
export PROXY=$proxyHost:$proxyPort
export YT_LOCAL_CLUSTER_ID=ui

if [ "$WITH_AUTH" != "" ]; then
  export YT_TOKEN=password
fi

curl http://${PROXY}/hosts | head -n 1 | grep '\["'
if [ $? -ne 0 -o "${useStop}" = "1" ]; then

  runScript=${__YT_RUN_LOCAL_CLUSTER_SH}

  if [ -z "${__YT_RUN_LOCAL_CLUSTER_SH}" ]; then
    srcUrl=https://raw.githubusercontent.com/ytsaurus/ytsaurus/main/yt/docker/local/run_local_cluster.sh
    echo Error: Cannot get list of hosts. Please make sure your proxy is available.
    echo -e "\nYou can use ${srcUrl} to run your local cluster:"
    read -p "Do you want to download the file? [yN]: " getAndRun
    if [ "$getAndRun" = "y" -o "$getAndRun" = "Y" ]; then
      curl -o run_local_cluster.sh ${srcUrl}
      chmod u+x run_local_cluster.sh
    fi

    runScript=./run_local_cluster.sh
    echo -e "\n\nrun_local_cluster.sh is downloaded, to run your cluster use command:"
  fi

  command="
    $runScript
      --cluster-name $YT_LOCAL_CLUSTER_ID
      --yt-version stable
      --docker-hostname $(hostname)
      --fqdn localhost
      --node-count 2
      --ui-app-installation ${APP_INSTALLATION:-''}
      --init-operations-archive
  "

  (
    echo
    echo "Use following environment variables to control behavior of the script:"
    echo "    PROMETHEUS=1     - to add --run-prometheus"
    echo "    SKIP_PULL=1      - to add --ui-skip-pull true --yt-skip-pull true"
    echo "    WITH_AUTH=1      - to add --with-auth, also adds 'export YT_TOKEN=password'"
    echo "    DEBUG_LOGGING=1  - to add --enable-debug-logging"
    echo "    "
  ) >&2

  if [ "$PROMETHEUS" != "" ]; then
    command="$command --run-prometheus"
  fi

  if [ "$SKIP_PULL" != "" ]; then
    command="$command --ui-skip-pull true --yt-skip-pull true"
  fi

  if [ "$WITH_AUTH" != "" ]; then
    command="$command --with-auth"
  fi

  if [ "$DEBUG_LOGGING" != "" ]; then
    command="$command --enable-debug-logging"
  fi

  if [ "$UI_VERSION_LOCAL" != "" ]; then
    docker tag $(npm run -s show:docker-image-name):local $(npm run -s show:docker-image-name:stable):local
    command="$command --ui-version $UI_VERSION_LOCAL --ui-skip-pull true"
  fi

  echo
  echo "The command bellow will be used to start your cluster:"
  echo "$command" | xargs -I {} echo "    {} \\"
  echo

  if [ "${useStop}" = "1" ]; then
    echo Trying to stop running containers:
    $command --stop
  else
    needToStart=y
  fi

  test -n "needToStart" || read -p "Do you want to start local cluster? [Yn]: " needToStart

  if [ "${needToStart}" = "" -o "${needToStart}" = "y" -o "${needToStart}" = "Y" ]; then
    $command --stop
    $command || exit 1
  else
    exit 1
  fi

else
  GREEN='\033[1;32m'
  NC='\033[0m' # No Color

  echo
  echo Localmode environment is prepared:
  echo -e $GREEN
  echo APP_ENV=$APP_ENV
  echo PROXY=$PROXY
  echo APP_INSTALLATION=$APP_INSTALLATION
  echo YT_LOCAL_CLUSTER_ID=$YT_LOCAL_CLUSTER_ID
  echo -e $NC
fi

if [ "$PROMETHEUS" != "" ]; then
  npm run e2e:localmode:monitoring:init
  export PROMETHEUS_BASE_URL=http://$(hostname):9090
fi
