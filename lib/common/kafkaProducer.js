/**
 * Created by Administrator on 2017/3/7.
 */

const kafka = require('kafka-node');
let co = require('co');

class KafkaProducer {
    constructor(zkConnInfo,productName) {

        console.log('KafkaProducer constructor zkConnInfo:' + zkConnInfo + ' productName:' + productName);
        this.client = new kafka.Client(/*`${serverHost}:${serverPort}`*/ zkConnInfo, productName);
        let HighLevelProducer = kafka.HighLevelProducer;
        this.producer = new HighLevelProducer(this.client);

        this.isKafkaReady = false;

        let context = this;
        this.producer.on('ready', function () {
            console.log(' producer ready!!');
            context.isKafkaReady = true;
        });

        this.producer.on('error', function (err) {
            console.error('error:' + err);
        });

        console.log('KafkaProducer constructor end.');
    };

    checkIsReady()
    {
        return this.isKafkaReady;
    }

    *sendMsg(topicName,msgObj) {

        let msgStrs = JSON.stringify(msgObj);
        console.log(msgStrs);
        let  payloads = [
            { topic: topicName, messages: msgStrs}
        ];

        let context = this;
        return yield new Promise(function (reslove,reject) {
            if(!context.isKafkaReady)
            {
                reject('kafka is not ready!!');
            }
            else
            {
                context.producer.send(payloads, function (err, data) {
                    if(err)
                    {
                        console.error(err);
                        reject(err);
                    }
                    else
                    {
                        console.log(data);
                        reslove(data);
                    }
                });
            }

        });


    }


}

module.exports = KafkaProducer;






