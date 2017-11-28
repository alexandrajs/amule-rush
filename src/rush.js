"use strict";
/**
 * @author Michał Żaloudik <ponury.kostek@gmail.com>
 */
const Redis = require("ioredis");
const fast = require("fast.js");

/**
 *
 * @constructor
 */
function Rush(options) {
	options = fast.assign({prefix: ""}, options || {});
	/**
	 *
	 * @type {object}
	 */
	this.next = null;
	/**
	 *
	 */
	this.client = options.client instanceof Redis ? options.client : new Redis(options.client);
	this.prefix = options.prefix || "";
	this.ttl = parseInt(options.ttl, 10) || 0;
	this.clearStats();
}

/**
 *
 * @param key
 * @param field
 * @param callback
 */
Rush.prototype.has = function (key, field, callback) {
	this.client.hget(this.prefix + key, field, (err, value) => {
		if (err || value === null) {
			return callback(null, false);
		}
		callback(null, true);
	});
};
/**
 *
 * @param key
 * @param field
 * @param callback
 */
Rush.prototype.get = function (key, field, callback) {
	this.client.hget(this.prefix + key, field, (err, value) => {
		if (!err && value !== null) {
			this.stats.hits++;
			return callback(null, JSON.parse(value));
		}
		this.stats.misses++;
		if (this.next !== null) {
			return this.next.get(key, field, (next_err, value) => {
				if (next_err) {
					return callback(next_err);
				}
				if (value === null) {
					return callback(err, null);
				}
				this.client.hset(this.prefix + key, field, JSON.stringify(value), () => {
					callback(null, value);
				});
			});
		}
		callback(err, null);
	});
};
/**
 *
 * @param key
 * @param field
 * @param value
 * @param callback
 */
Rush.prototype.set = function (key, field, value, callback) {
	this.client.hset(this.prefix + key, field, JSON.stringify(value), (err) => {
		if (this.next !== null) {
			return this.next.set(key, field, value, callback);
		}
		callback(err);
	});
};
/**
 *
 * @param key
 * @param field
 * @param callback
 */
Rush.prototype.delete = function (key, field, callback) {
	this.client.hdel(this.prefix + key, field, (err) => {
		if (this.next !== null) {
			return this.next.delete(key, field, callback);
		}
		callback(err, null);
	});
};
/**
 * @param [propagate]
 * @param callback
 * @todo implement
 */
Rush.prototype.clear = function (propagate, callback) {
	if (typeof propagate === "function") {
		callback = propagate;
		propagate = undefined;
	}
	const stream = this.client.scanStream({match: this.prefix + "*"});
	stream.on("data", (resultKeys) => {
		this.client.del(resultKeys.join(' '));
	});
	stream.on("end", () => {
		if (propagate && this.next) {
			return this.next.clear(propagate, callback);
		}
		callback(null, true);
	});
};
/**
 * @param [clear]
 * @returns {{hits: number, misses: number, ratio: number}}
 */
Rush.prototype.getStats = function (clear) {
	const stats = this.stats;
	stats.ratio = stats.hits && stats.misses ? stats.hits / stats.misses : 0;
	if (clear) {
		this.clearStats();
	}
	return stats;
};
/**
 *
 */
Rush.prototype.clearStats = function () {
	this.stats = {
		hits: 0,
		misses: 0
	};
};
module.exports = Rush;
