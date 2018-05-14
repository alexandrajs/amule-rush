# Redis layer for AlexandraJS aMule

[![Build Status](https://travis-ci.org/alexandrajs/amule-rush.svg?branch=master)](https://travis-ci.org/alexandrajs/amule-rush)
[![Coverage Status](https://coveralls.io/repos/github/alexandrajs/amule-rush/badge.svg?branch=master)](https://coveralls.io/github/alexandrajs/amule-rush?branch=master)
[![Code Climate](https://codeclimate.com/github/alexandrajs/amule-rush/badges/gpa.svg)](https://codeclimate.com/github/alexandrajs/amule-rush)

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
[Redis layer API](http://alexandrajs.github.io/amule-rush/)
