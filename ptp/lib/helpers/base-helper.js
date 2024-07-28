const _ = require('lodash');
const fs = require('fs');
const pgp = require('pg-promise')();
const redis = require('redis');

class BaseHelper {
  constructor(config) {
    this.config = config
  }

  async _getConfig(config) {
    return JSON.parse(await fs.readFileSync(config));
  }

  async bootup() {
    this.config = await this._getConfig(this.config);

    let pgConnection = this._getDbConnection(this.config);
    let redisConnection = await this._getRedisConnection(this.config);

    this.dependencies = {
      pgp: pgConnection,
      redis: redisConnection
    }
  }

  _getDbConnection(config) {
    const connection = pgp({
      user: config.infra.postgres.user,
      host: config.infra.postgres.host,
      database: config.infra.postgres.database,
      password: config.infra.postgres.password,
      port: config.infra.postgres.port || 5432,
    });

    return connection;
  }

  async _getRedisConnection(config) {
    const connection = redis.createClient({
      host: config.infra.redis.host,
      port: config.infra.redis.port,
      password: config.infra.redis.password,
      db: config.infra.redis.db
    });
    
    return await connection.connect();
    //ToDo - Write logic to close connection and reconnect. Also pooling logic
  }

  async transaction(txFn) {
    try {
      const result = await this.dependencies.pgp.tx(txFn);
      return result;
    } catch (error) {
      console.error('Transaction error:', error);
      throw error;
    }
  }

  async setRedisKey(key, value, expiry = '10') {
    try {
      await this.dependencies.redis.set(key, value, {
        EX: expiry,
        NX: false //ToDo - Need to cudtomize this
      });
    } catch (err) {
      console.log('Error in setting redis key : ', err);
      throw err;
    }
  }

  async getRedisKey(key) {
    try {
      return await this.dependencies.redis.get(key);
    } catch (err) {
      console.log('Error in getting redis key : ', err);
      throw err;
    }
  }
}

module.exports = BaseHelper;