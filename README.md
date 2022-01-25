<p align="left">
<img width=15% src="https://dai.lids.mit.edu/wp-content/uploads/2018/06/Logo_DAI_highres.png" alt=“DAI-Lab” />
<i>An open source project from Data to AI Lab at MIT.</i>
</p>

[![Coverage Status](https://coveralls.io/repos/github/dyuliu/MTV/badge.svg)](https://coveralls.io/github/dyuliu/MTV)
[![Github All Releases](https://img.shields.io/github/downloads/dyuliu/MTV/total)](https://github.com/dyuliu/MTV/releases)
[![Docker Pulls](https://img.shields.io/docker/pulls/dyuliu/mtv)](https://hub.docker.com/r/dyuliu/mtv)

# MTV

**MTV** is a visual analytics system built for anomaly analysis of multiple time-series data.

## License

[The MIT License](https://github.com/HDI-Project/MTV/blob/master/LICENSE)

## Prerequisites

Make sure you have installed all of the following prerequisites on your development machine:

-   **Sintel** - MTV is the visual interface that requires running sintel as the backend. Please install [Sintel](https://github.com/sintel-dev/sintel) first if you want to try the full feature of MTV.
-   **Node.js (>= 10.0.0)** - [Download & Install Node.js](https://nodejs.org/en/download/) and the npm package manager. Make sure to install gulp-cli globally after the installation of Node.js.

## Get Started

### Install

Download the repository

```bash
$ git clone https://github.com/sintel-dev/MTV mtv
```

Once you've downloaded the MTV repository and installed all the prerequisites, you're just a few steps away from running your application. To install the project, create a virtualenv and execute

```bash
$ npm install
```

### Running Your Application

#### 1. Run Sintel as the backend
Please make sure Sintel runs on the port 3000. If not, you can change the config in the file `src/model/utils/constants.tsx` to ensure that MTV is able to connect to Sintel correctly.

#### 2. Build MTV
```bash
$ npm run build
```

#### 3. Launch it
```bash
$ npm run serve
```

Your application should run on **port 4200** with the **_production_** environment by default. Just go to [http://localhost:4200](http://localhost:4200) in your browser (Chrome recommended).

### Development
If you want to make changes on the interface and customize it to your own application scenario, you can run the following command:

```bash
$ npm -C client start
```

Everytime you make changes on the source code, the interface will be automatically refreshed.
