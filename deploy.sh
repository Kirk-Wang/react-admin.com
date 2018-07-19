#!/bin/bash

yarn && cd website && yarn run write-translations
sudo apt-get update
sudo apt-get install default-jre rsync
wget https://artifacts.crowdin.com/repo/deb/crowdin.deb -O crowdin.deb
sudo dpkg -i crowdin.deb
sleep 5
yarn run crowdin-upload
yarn run crowdin-download
GIT_USER=9renpoto USE_SSH=true yarn run publish-gh-pages
