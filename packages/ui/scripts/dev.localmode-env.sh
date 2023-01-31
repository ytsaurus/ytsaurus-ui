read -p "Proxy host [`hostname`]: " proxyHost
if [ -z "$proxyHost" ]; then
  proxyHost=`hostname`
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
  echo Error: Cannot get list of hosts. Please make sure your proxy is available.
  exit 1
fi
