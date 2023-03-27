#!/bin/bash
set -e

export DEBIAN_FRONTEND=noninteractive
export TZ=Etc/UTC

# nodejs
curl -fsSL https://deb.nodesource.com/setup_14.x | sudo -E bash -
apt-get install -y nodejs gcc g++ make 

# docker
apt-get install \
    ca-certificates \
    curl \
    gnupg

mkdir -m 0755 -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null

chmod a+r /etc/apt/keyrings/docker.gpg

apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Python
apt install -y python3-venv python3-pip
pip install ytsaurus-client
pip install ytsaurus-yson

# Cleanup
apt-get -y autoremove --purge
apt-get -y clean
apt-get -y autoclean

# Playwright
git clone https://github.com/ytsaurus/ytsaurus-ui.git
cd ytsaurus-ui/packages/ui/tests
npm ci
npx playwright install
npx playwright install-deps 
cd - && rm -rf ./ytsaurus-ui
