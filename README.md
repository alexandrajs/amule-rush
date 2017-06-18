# Redis layer for AlexandraJS aMule

[![Build Status](https://travis-ci.org/alexandrajs/aMule-Rush.svg?branch=master)](https://travis-ci.org/alexandrajs/aMule-Rush)
[![Coverage Status](https://coveralls.io/repos/github/alexandrajs/aMule-Rush/badge.svg?branch=master)](https://coveralls.io/github/alexandrajs/aMule-Rush?branch=master)
[![Code Climate](https://codeclimate.com/github/alexandrajs/aMule-Rush/badges/gpa.svg)](https://codeclimate.com/github/alexandrajs/aMule-Rush)

## Installation
```bash
$ npm i amule-rush --save
```

## Usage
```javascript
const AMule = require('amule');
const Aim = require('amule-aim');
const Rush = require('amule-rush');
const mule = new AMule();

// Add some compatible caches
mule.use(new Aim());
mule.use(new Rush());

// Use it as single cache
```

## API docs
[Redis layer API](http://alexandrajs.github.io/aMule-Rush/)
