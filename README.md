[![Build Status](https://travis-ci.org/xblanc33/mrs-sam-page.svg?branch=master)](https://travis-ci.org/xblanc33/mrs-sam-page)

# Mrs-Sam Page : A crawler for fetching a huge set of web pages

Mrs-Sam Page is a distributed crawler designed to crawl any web site and to fetch huge sets of web pages.

## Installation

Clone the repository and perform `npm install` in the page folder.

For each site it crawls, Mrs-Sam-Page creates one manager and several workers.

## Run Mrs-Sam-Page 

Mrs-Sam Page is coming with a Docker compose installer.

Go to the docker directory and run:

    docker-compose build

Then run:

	docker-compose run 

Mrs-Sam-Page is then running !

## Use the Web GUI

When Mrs-Sam-Page is running, you can reach the Web GUI by using your browser (http://localhost:8080)

Thanks to the Web GUI you can crawl any given web site. Mrs-Sam-Page will create one manager and the number of Workers you want (3 is a good start).

## Run Independent Workers

For running one independent Worker, go to the root directory and run

    npm install

    node ./workerCLI.js 


By default, the Worker will look at the localhost IP to find Managers. 
It will then ask you to choose for which active one you want to create a worker.

Worker can reach any Manager that is running on any Mrs-Sam-Page :

	node ./workerCLI.js --master=IP_OF_MRS-SAM-PAGE


## See the results

Mrs-Sam-Page has a MongoDB and a file server (SFTP).

Each Manager has its own ID, usd to create independent MongoDB collection and SFTP directory.

You can use RoboMongo or FileZilla to connect them and to get the results.



