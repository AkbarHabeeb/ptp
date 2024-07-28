const _ = require('lodash');
const nconf = require('nconf').argv();
const IntraDayDataPullProcessor = require('../intraday-data-pull-processor');

async function main() {
  try {
    let config = nconf.get('config');
    if (!_.isEmpty(config)) {
      let worker = new IntraDayDataPullProcessor(config);
      await worker.start();
    } else {
      console.log('Please pass config in args')
    }
  } catch (err) {
    console.log(err);
  } finally {
    console.log('Worked processed - IntraDay pulled')
  }
}

main();