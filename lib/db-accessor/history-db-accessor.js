const uuid = require('uuid');

class HistoryDbAccessor {
  constructor() {
    this.queries = {
      insert: 'INSERT INTO HISTORY (id, stock_id, data, is_active) values ($1, $2, $3, $4);',
      selectByStockId: 'SELECT * FROM HISTORY WHERE stock_id = $1'
    }
  }

  async dbInsert(t, stockId, data) {
    await t.none(this.queries.insert, [
      uuid.v4(),
      stockId,
      data,
      1
    ])
  }

  async dbGetByStockId(t, stockId) {
    return await t.any(this.queries.selectByStockId, [stockId])
  }
}

module.exports = HistoryDbAccessor;