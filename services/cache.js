const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');
const keys = require('../config/keys')

const client = redis.createClient(keys.redisUrl);
// client.get = util.promisify(client.get);
client.hget = util.promisify(client.hget);

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function (options = {}) {

  // define your own top level property
  this._useCache = true;
  this._hashKey = JSON.stringify(options.key || '')

  return this; // make .cache chainable. .cache.sort.limit
}

mongoose.Query.prototype.exec = async function (params) {
  console.log('ABOUT TO RUN A QUERY');
  // console.log(this.getQuery())
  // console.log(this.mongooseCollection.name);

  if (!this._useCache) { // manual flag, no cache
    return exec.apply(this, arguments);
  }

  const key = JSON.stringify(Object.assign({}, this.getQuery(), {
    collection: this.mongooseCollection.name
  }))

  // 1. check if we have value for 'key in redis
  // const cacheValue = await client.get(key)
  const cacheValue = await client.hget(this._hashKey, key)

  // 2. if yes, return that value
  if (cacheValue) {
    console.log("FROM cache")
    const doc = JSON.parse(cacheValue)
    return Array.isArray(doc) ? doc.map(d => new this.model(d)) : new this.model(doc)
    // return JSON.parse(cacheValue)
  }

  // otherwise, issue the query and store the result in redis
  const result = await exec.apply(this, arguments); // mongoose always return a mongoose document
  console.log('FROM mongodb')

  // client.set(key, JSON.stringify(result))
  client.hset(this._hashKey, key, JSON.stringify(result), 'EX', 10)
  return result
};


module.exports = {
  clearHash(hashKey) {
    client.del(JSON.stringify(hashKey));
  }
}



