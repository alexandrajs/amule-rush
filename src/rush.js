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
		options = fast.assign({prefix: ""}, options || {});
		this.client = options.client instanceof Redis ? options.client : new Redis(options.client);
		this.prefix = options.prefix || "";
		this.ttl = parseInt(options.ttl, 10) || 0;
	}

	/**
	 *
	 * @param key
	 * @param field
	 * @param callback
	 */
	_has(key, field, callback) {
		this.client.hget(this.prefix + key, field, (err, value) => {
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
		this.client.hget(this.prefix + key, field, (err, value) => {
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
		this.client.hset(this.prefix + key, field, JSON.stringify(value), callback);
	};

	/**
	 *
	 * @param key
	 * @param field
	 * @param callback
	 */
	_delete(key, field, callback) {
		this.client.hdel(this.prefix + key, field, callback);
	};

	/**
	 * @param callback
	 */
	_clear(callback) {
		const stream = this.client.scanStream({match: this.prefix + "*"});
		stream.on("data", (keys) => {
			this.client.del(keys.join(" "));
		});
		stream.on("end", () => callback(null, true));
	};
}

module.exports = Rush;
