read -p "Do you want to try to stop running containers yt.backend, yt.frontend? [yN]: " needToStop
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

curl http://${PROXY}/hosts | head -n 1 | grep '\["'
if [ $? -ne 0 -o "${useStop}" = "1" ]; then
  srcUrl=https://raw.githubusercontent.com/ytsaurus/ytsaurus/85b79ee968a7d36258daa705929404ac4bfdc0c4/yt/docker/local/run_local_cluster.sh
  echo Error: Cannot get list of hosts. Please make sure your proxy is available.
  echo -e "\nYou can use ${srcUrl} to run your local cluster:"
  read -p "Do you want to download the file? [yN]: " getAndRun
  if [ "$getAndRun" = "y" -o "$getAndRun" = "Y" ]; then
    curl -o run_local_cluster.sh ${srcUrl}
    chmod u+x run_local_cluster.sh
  fi

  echo -e "\n\nrun_local_cluster.sh is downloaded, to run your cluster use command:"

  command="./run_local_cluster.sh --yt-version stable --docker-hostname $(hostname) --fqdn localhost --node-count 2 --ui-app-installation ${APP_INSTALLATION:-''}"

  if [ "$SKIP_PULL" != "" ]; then
    command="$command --ui-skip-pull true --yt-skip-pull true"
  fi

  if [ "$UI_VERSION_LOCAL" != "" ]; then
    docker tag $(npm run -s show:docker-image-name):local $(npm run -s show:docker-image-name:stable):local
    command="$command --ui-version $UI_VERSION_LOCAL --ui-skip-pull true"
  fi

  echo -e "    $command \n"

  if [ "${useStop}" = "1" ]; then
    echo Trying to stop running containers:
    $command --stop
  fi

  read -p "Do you want to start local cluster? [Yn]: " needToStart
  if [ "${needToStart}" = "" -o "${needToStart}" = "y" -o "${needToStart}" = "Y" ]; then
    $command --stop
    $command
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
  echo -e $NC
fi
