const _ = require('lodash');
const nconf = require('nconf').argv();
const HistoricalDataProcessor = require('../historical-data-processor');

async function main() {
    try {
        let config = nconf.get('config');
        if (!_.isEmpty(config)) {
            let worker = new HistoricalDataProcessor(config);
            await worker.start();
        } else {
            console.log('Please pass config in args')
        }
    } catch (err) {
        console.log(err);
    } finally {
        console.log('Worked processed - History pulled')
    }
}

main();