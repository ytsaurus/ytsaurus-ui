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

echo
echo localmode environment is prepared:
echo APP_ENV=$APP_ENV
echo PROXY=$PROXY
echo

curl http://${PROXY}/hosts | head -n 1 | grep '\["'
if [ $? -ne 0 ]; then
  srcUrl=https://raw.githubusercontent.com/ytsaurus/ytsaurus/main/yt/docker/local/run_local_cluster.sh
  echo Error: Cannot get list of hosts. Please make sure your proxy is available.
  echo -e "\nYou can use ${srcUrl} to run you local cluster:"
  read -p "Do you want to download the file [yN]:" getAndRun
  if [ "$getAndRun" = "y" -o "$getAndRun" = "Y" ]; then
    curl -o run_local_cluster.sh ${srcUrl}
    chmod u+x run_local_cluster.sh
    echo -e "\nrun_local_cluster.sh is downloaded, to run your cluster use command:"
    echo -e "      ./run_local_cluster.sh --docker-hostname $(hostname)\n"
  fi
  exit 1
fi
