# node-n-parallel

A small library to allow you easy access to an async array-map that uses a user-defined amount of workers instead of doing all jobs in sequence or parallel. This is e.g. usefull when fetching huge amounts of web requests and optimising for both time performance and not ddos-ing your target.


![Depfu](https://img.shields.io/depfu/fent/node-miniget)
[![codecov](https://codecov.io/gh/fent/node-miniget/branch/master/graph/badge.svg)](https://codecov.io/gh/fent/node-miniget)

# Usage

Request a bunch of Websites

```js
const nparallel = require('n-parallel');

const pages = await nparallel(
    // Input data
    ['website1.com', 'website2.com', 'website3.con'],
    // The Map-Function is identical to the default <array>.map
    async(url, idx, array) => await fetch(url),
    // Number of Workers
    2,
);
```

By-default we also expand the Array prototype

```js
require('n-parallel');

const pages = ['website1.com', 'website2.com', 'website3.con'].nmap(
    // The Map-Function is identical to the default <array>.map
    async(url, idx, array) => await fetch(url),
    // Number of Workers
    2,
)
```

# API

### nparallel(data, mapFunc, numWorkers)

* `data` - An array of input data to map.
* `mapFunc` - An async function used to map a single `data`-Element to a single output data object.
* `numWorkers`- An integer describing how many workers should work on mapping.

nparallel returns a Promise that resolves to the objects created by the `mapFunc`.


# Install
```bash
npm install miniget
```


# Tests
Tests are written with [mocha](https://mochajs.org)

```bash
npm test
```
