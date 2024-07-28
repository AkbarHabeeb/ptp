const uuid = require('uuid');

class IntraDayDbAccessor {
  constructor() {
    //ToDo: Add JOI Schema
    this.queries = {
      insert: 'INSERT INTO INTRADAY (id, stock_id, data, trade_date, is_active) values ($1, $2, $3, $4, $5);',
      selectByStockId: 'SELECT data FROM INTRADAY WHERE stock_id = $1 AND trade_date = $2',
      updateByStockId: 'UPDATE INTRADAY SET data = $1, modified_date = now() WHERE stock_id = $2 AND trade_date = $3'
    }
  }

  async dbInsert(t, stockId, data, tradeDate) {
    await t.none(this.queries.insert, [
      uuid.v4(),
      stockId,
      data,
      tradeDate,
      1
    ])
  }

  async dbGetByStockIdAndTradeDate(t, stockId, tradeDate) {
    return await t.any(this.queries.selectByStockId, [stockId, tradeDate])
  }

  async dbUpdate(t, stockId, data, tradeDate) {
    await t.none(this.queries.updateByStockId, [
      data,
      stockId,
      tradeDate
    ])
  }
}

module.exports = IntraDayDbAccessor;