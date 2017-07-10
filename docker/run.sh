#!/bin/bash
rm -fr work
mkdir -p work 
cd work
git clone https://github.com/mrs-sam/page.git
ls 
cd mrs-sam-page
npm install
xvfb-run --server-args="-screen 0 1024x768x24" node ./server.js --mongo="mongo" --rabbit="rabbit" --sftp="sftp"