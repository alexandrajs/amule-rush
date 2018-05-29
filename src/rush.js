"use strict";
/**
 * @author Michał Żaloudik <ponury.kostek@gmail.com>
 */
const Redis = require("ioredis");
const fast = require("fast.js");
const Layer = require("amule").Layer;

/**
 *
 * @constructor
 */
class Rush extends Layer {
	constructor(options) {
		super();
		this.options = fast.assign({
			prefix: "",
			cluster: false,
			ttl: 0
		}, options || {});
		if (this.options.client && this.options.client.constructor && this.options.client.constructor.name === "Redis") {
			this.client = this.options.client;
		} else {
			if (this.options.cluster) {
				this.client = new Redis.Cluster(this.options.client);
			} else {
				this.client = new Redis(this.options.client);
			}
		}
	}

	/**
	 *
	 * @param key
	 * @param field
	 * @param callback
	 */
	_has(key, field, callback) {
		this.client.hget(this.options.prefix + key, field, (err, value) => {
			if (err || typeof value !== "string") {
				return callback(err, false);
			}
			try {
				JSON.parse(value);
				callback(err, true);
			} catch (err) {
				callback(err, false);
			}
		});
	};

	/**
	 *
	 * @param key
	 * @param field
	 * @param callback
	 */
	_get(key, field, callback) {
		this.client.hget(this.options.prefix + key, field, (err, value) => {
			callback(err, typeof value === "string" ? JSON.parse(value) : value);
		});
	};

	/**
	 *
	 * @param key
	 * @param field
	 * @param value
	 * @param callback
	 */
	_set(key, field, value, callback) {
		this.client.hset(this.options.prefix + key, field, JSON.stringify(value), (err) => {
			if (err || !this.options.ttl) {
				return callback(err);
			}
			this.client.expire(this.options.prefix + key, this.options.ttl, callback);
		});
	};

	/**
	 *
	 * @param key
	 * @param field
	 * @param callback
	 */
	_delete(key, field, callback) {
		this.client.hdel(this.options.prefix + key, field, callback);
	};

	/**
	 * @param callback
	 */
	_clear(callback) {
		const stream = this.client.scanStream({match: this.options.prefix + "*"});
		stream.on("data", (keys) => {
			this.client.del(keys.join(" "));
		});
		stream.on("end", () => callback(null, true));
	};
}

module.exports = Rush;
