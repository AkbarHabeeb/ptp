const _ = require('lodash')
const axios = require('axios');
const Enums = require('../helpers/enum')

class UpstoxAdapter {
  constructor(config) {
    this.apiVersion = config.service.upstox.api_version;
    this.baseurl = 'https://api.upstox.com/v2';
    this.baseHeaders = {
      'Api-Version': this.apiVersion,
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + config.service.upstox.access_token,
    }
  }

  async getHistoricalCandleDataBetweenDates(instrumentKey, interval, toDate, fromDate) {
    const me = this;
    let url = me.baseurl + '/historical-candle/' + instrumentKey + '/' + interval + '/' + toDate + '/' + fromDate;
    let response;
    try {
      response = await axios.get(url, {
        headers: me.baseHeaders
      });

      if (response.status === Enums.responseCode.Success) {
        return {
          stockId: instrumentKey,
          data: JSON.parse(JSON.stringify(response.data.data))
        };
      } else {
        console.log('Errored')
      }
    } catch (err) {
      console.log('Errored response' + _.get(err, 'response.status') + JSON.stringify(_.get(err, 'response.data')))
    }
  }

  async getMarketQuoteBySymbols(symbols) {
    const me = this;
    let url = me.baseurl + '/market-quote/quotes?symbol=' + symbols;
    let response;
    try {
      response = await axios.get(url, {
        headers: me.baseHeaders
      });

      if (response.status === Enums.responseCode.Success) {
        return response.data.data;
      } else {
        console.log('Errored')
      }
    } catch (err) {
      console.log('Errored response' + _.get(err, 'response.status') + JSON.stringify(_.get(err, 'response.data')))
    }
  }
}

module.exports = UpstoxAdapter;