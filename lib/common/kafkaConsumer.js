/**
 * Created by Administrator on 2017/3/7.
 */

const kafka = require('kafka-node');
let co = require('co');
const _ = require('lodash');

class KafkaConsumer {
    constructor(zkConnInfo, consumerName) {

        console.log('KafkaConsumer-->constructor zkConnInfo:' + zkConnInfo + ' consumerName:' + consumerName);

        this.client = new kafka.Client(/*`${serverHost}:${serverPort}`*/ zkConnInfo, consumerName);


        this.consumerList = [];

        this.topicName = '';
        this.groupName = '';
        this.onMsgFunc = null;
        this.context   = null;
        this.bResetting = false;

        this.consumerName = consumerName;


    };

    createConsumer(groupName, topicName,onMsgFunc,context) {
        let HighLevelConsumer = kafka.HighLevelConsumer;
        let consumer = new HighLevelConsumer(
            this.client,
            [
                {topic: topicName}
            ],
            {
                groupId: groupName,
                autoCommit: false,
            }
        );
        this.consumerList.push(consumer);

        this.groupName = groupName;
        this.topicName = topicName;
        this.onMsgFunc = onMsgFunc;
        this.context = context;

        console.log('init kafka consumer ready!!');

        function commitFunc() {
            consumer.commit(function (err, data) {
                if (err) {
                    console.error('kafka -- commit msg error: ', JSON.stringify(err, null, 2));
                }
                else {
                    console.log('kafka -- commit msg ok, data: ', JSON.stringify(data));
                }
            });
        }


        consumer.on('message', function (message) {
            console.log('recv msg from topic:%s ,msg: %s',topicName, JSON.stringify(message));

            co.wrap(onMsgFunc).call(context, message.value)
                .then(function(data){
                    console.log('msg dispatch  orderMsg success data:',data);
                    commitFunc();

                })
                .catch(function(err){
                    console.log('msg dispatch error:' + err);
                    commitFunc();
                });
        });

        let objThis = this;

        consumer.on('error', function (err) {
            console.error('error:' + err);

            let errJson = JSON.stringify(err);
            console.warn('kafka errJson:'+errJson + ' ,topicName:' + objThis.topicName);

            /** 2017/7/3   暂时关闭复位消费者功能，因为发生的机率很低。
             lpy-modifyed  */


            /*    if (/!*errJson.indexOf(/!*'NODE_EXISTS'*!/ 'Error') >= 0 &&*!/ !objThis.bResetting)
                {
                    objThis.bResetting = true;
                    console.error('node_exist error ,will reOpen consumer!!!');
    
                        objThis.closeConsumer()
                            .then(function (data) {
                                console.log('close consumer success ,ok ,topicName:', objThis.topicName);
    
                                setTimeout(function openConsumer( ) {
                                    console.log(' reCreate consumer ,topicName:', objThis.topicName);
                                    objThis.createConsumer(objThis.groupName,objThis.topicName,objThis.onMsgFunc,objThis.context);
                                },5000);
    
                            })
                            .catch(function (err) {
                                console.log('close consumer error:' + err);
                            });
    
                }
                else
                {
                    console.warn('kafka consumer current is resetting!!!');
                }*/

        });

        consumer.on('offsetOutOfRange', function (err) {
            console.error('offsetOutOfRange:' + err);
        });

        this.bResetting = false;

    }

    closeConsumer()
    {
        let consumer = this.consumerList[0];
        let topicName = this.topicName;
        let consumerName = this.consumerName;

        let objThis = this;

        return  new Promise(function (resolve,reject) {
            consumer.close(true, function () {
                console.log('Consumer Closed consumerName:' + consumerName +
                    ' topicName :'+topicName);

                objThis.consumerList.splice(0,objThis.consumerList.length);

                resolve("ok");

            });
        })
    }

}


module.exports = KafkaConsumer;


