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
	/**
	 *
	 * @param {Object} [options]
	 * @param {Redis|Object} [options.client]
	 * @param {boolean} [options.cluster=false]
	 * @param {string} [options.prefix=""]
	 * @param {number} [options.ttl=0]
	 */
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
	 * @param {string} key
	 * @param {string} field
	 * @param {function} callback
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
	 * @param {string} key
	 * @param {string} field
	 * @param {function} callback
	 */
	_get(key, field, callback) {
		this.client.hget(this.options.prefix + key, field, (err, value) => {
			callback(err, typeof value === "string" ? JSON.parse(value) : value);
		});
	};

	/**
	 *
	 * @param {string} key
	 * @param {string} field
	 * @param value
	 * @param {function} callback
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
	 * @param {string} key
	 * @param {string} field
	 * @param {function} callback
	 */
	_delete(key, field, callback) {
		this.client.hdel(this.options.prefix + key, field, callback);
	};

	/**
	 * @param {function} callback
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
