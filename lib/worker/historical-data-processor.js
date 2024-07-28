let _ = require('lodash');
let moment = require('moment');
let BaseHelper = require('../helpers/base-helper');
let Enums = require('../helpers/enum');
let HistoryDbAccessor = require('../db-accessor/history-db-accessor');
const UpstoxAdapter = require('../adapter/upstox-adapter');

class HistoricalDataProcessor extends BaseHelper {
  constructor(config) {
    super(config);
  }

  async start() {
    const me = this;
    await me.bootup();
    me.upstoxAdapter = new UpstoxAdapter(me.config);
    me.historyDbAccessor = new HistoryDbAccessor();

    let interval = 'day'
    let fromDate = me.config.service.history.from_date;
    let toDate = moment().format('YYYY-MM-DD');

    for (let instrument of Enums.supportStocks) {
      let instrumentKey = instrument;
      let { stockId, data } = await me.upstoxAdapter.getHistoricalCandleDataBetweenDates(instrumentKey, interval, toDate, fromDate);

      if (_.isEmpty(data)) {
        return;
      }

      await me.transaction(async (t) => {
        await me.historyDbAccessor.dbInsert(t, stockId, data);
      })
    }
  }
}

module.exports = HistoricalDataProcessor;