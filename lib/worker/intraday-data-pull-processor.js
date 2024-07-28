let _ = require('lodash');
let moment = require('moment');
let BaseHelper = require('../helpers/base-helper');
let Enums = require('../helpers/enum');
let IntraDayDbAccessor = require('../db-accessor/intra-day-db-accessor');
const UpstoxAdapter = require('../adapter/upstox-adapter');

class IntraDayDataPullProcessor extends BaseHelper {
  constructor(config) {
    super(config);
  }

  /**
   * Aimed to pull data for all stocks every 5 seconds
   */
  async start() {
    const me = this;
    await me.bootup();
    me.upstoxAdapter = new UpstoxAdapter(me.config);
    me.intraDayDbAccessor = new IntraDayDbAccessor();
    let symbols = (Enums.supportStocks).join(',');

    let counter = 1;
    while (counter) {
      try {
        await me.pullIntraDay(symbols);
      } catch (err) {
        console.log('Error in pullIntraDay')
      }

      setTimeout(() => {
        console.log("Poll for real time data. Sleep 2 Seconds");
      }, 5000);

      counter--;
    }
  }

  async pullIntraDay(symbols) {
    const me = this;
    let intraDayData = await me.upstoxAdapter.getMarketQuoteBySymbols(symbols);
    let listOfSymbols = _.keys(intraDayData);
    let tradeDate = moment().format('YYYY-MM-DD');

    for (let i = 0; i < _.size(listOfSymbols); i++) {
      let stockData = intraDayData[listOfSymbols[i]]
      let instrumentKey = stockData.instrument_token;

      try {
        await me.transaction(async (t) => {
          let currentStockData = await me.intraDayDbAccessor.dbGetByStockIdAndTradeDate(t, instrumentKey, tradeDate);

          if (_.isEmpty(currentStockData)) {
            await me.intraDayDbAccessor.dbInsert(t, instrumentKey, stockData, tradeDate);
          } else {
            currentStockData = await me.prepareIntraDayData(stockData, currentStockData);
            await me.intraDayDbAccessor.dbUpdate(t, instrumentKey, currentStockData, tradeDate);
          }

          await me.setRedisKey(instrumentKey + '_IntraDay', JSON.stringify(currentStockData), 600);
        })
      } catch (err) {
        console.log('Intraday processing failed')
      }
    }
  }

  async prepareIntraDayData(liveStockData, currentStockData) {
    const me = this;
    me._mergeLiveDataWithCurrentStockData(liveStockData, currentStockData)
    return liveStockData;
  }

  /*
  ToDo - After market hours, few data will come as null.. those will override the current data in db. 
  This needs to be changed
  */
  _mergeLiveDataWithCurrentStockData(liveStockData, currentStockData) {
    liveStockData.total_buy_quantity = _.get(currentStockData, 'total_buy_quantity', 0) + liveStockData.total_buy_quantity
    liveStockData.total_sell_quantity = _.get(currentStockData, 'total_sell_quantity', 0) + liveStockData.total_sell_quantity
  }
}

module.exports = IntraDayDataPullProcessor;