/**
 * Created by licp on 2016-11-28.
 */



module.exports =
{
    //common目录。
    utils      :    require('./lib/common/utils'),
    log        :    require('./lib/common/log'),

    cacheAble      :    require('./lib/common/cacheAble'),

    kafkaProducer      :    require('./lib/common/kafkaProducer'),
    kafkaConsumer     :    require('./lib/common/kafkaConsumer'),

    //proxy目录。
    batchQueryUtils   :    require('./lib/proxy/batchQueryUtils'),
    distritubeExtraTranction   :    require('./lib/proxy/distritubeExtraTranction'),

};
