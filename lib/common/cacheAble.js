
var _=require('lodash');
//var log = require('./log').getLogger();

let co = require('co');

let configDebug = true;

/**=====<1.缓存实现开始==========**/
function toCache(time, key,redis,value) {
    if(value){
        var t = new Date();
        value = JSON.stringify(value);
        redis.set(key, value);
        if (time) {
            redis.expire(key, time);
        }
        if (configDebug) {
            var duration = new Date() - t;
            console.info('Cache set ' + key + ' ' + duration);
        }
    }
}

function fromCache(key,redis){
    return new Promise(function(resolve){
        var t = new Date();

        redis.get(key, function(err, data) {
            if (!data) {
                return resolve(null);
            }

            data = JSON.parse(data);

            if (configDebug) {
                var duration = new Date() - t;
                console.info('Cache get ' + key + ' ' + duration+' ms');
            }
            return resolve(data);
        });
    })
}
function loadAndCacheData(time, key, m, fn, redis,args) {
    var _cacheData = _.partial(toCache, time, key,redis);
    return new Promise(function (resolve) {
        co.wrap(fn).apply(m, args).then(function(data){
            _cacheData(data);
            return resolve(data);
        }).catch(function(err){
            console.log(err);
        });
    });
}
const qs = require('qs');
function getKey(fName,args) {
    let key = /*key_prefix+':'+*/ fName+(args.length>0?'@':'');
    for(let i=0; i< args.length; i++){
        if( 'object' == typeof args[i]){
            key += ( '('+ qs.stringify(args[i])+')')
        }
        else {
            key += ( '('+args[i]+')');
        }
    }
    return key;
}

function* withCache(time, keyBuilder, fName, m, fn,redis) {
    var args, key;
    args = Array.prototype.slice.call(arguments, 6);//转化成数组
    key  = keyBuilder(fName, args);  // compute cache key
    return yield  new Promise(function(resolve,reject){
        fromCache(key,redis).then(function(datas){
            if (datas) {// cache hit
                // console.log('cache hit');
                return resolve(datas);
            }else {// cache missed
                // console.log('cache missed');
                return resolve(loadAndCacheData.call(null, time, key,m, fn, redis,args));
            }
        }).catch(function(err){
            console.log('cache:' + err);
            reject(err);
        })
    })
}

function cacheable(m, fn, fName ,time,redis){
    return  _.partial(withCache, time, getKey, fName, m, fn,redis);
}
/**=====缓存实现结束==========>**/

/**<=====2.清空缓存实现开始=============**/
function clear(key,redis){
    if (configDebug) {
        console.info('Cache delete ' + key );
    }
    redis.del(key);
}

function clearVagueKeys(vagueKeys,redis){
    return new Promise((resolve,reject)=>
    {
        redis.keys(vagueKeys+'*', function(err, keys) {
            if(err)
                reject(err);

            if (configDebug) {
                console.info('Cache vague delete ' + JSON.stringify(keys));
            }
            if(keys.length > 0) redis.del(keys);
            resolve('ok');
        });
    });
}


function* withClear(m,keyBuilder, fNameList, fn,redis) {
    var args = Array.prototype.slice.call(arguments, 5);
/*
    var key  = keyBuilder(fName, args);
    clear(key,redis);//先清缓存然后调用具体业务
*/

    /** 2017/2/24  模糊匹配清除所有此KEY下相关的缓存。
     lpy-modifyed  */
    //clearBatchVagueKeys(fName,redis);

    return yield new Promise(function (resolve,reject) {
        co.wrap(fn).apply(m, args)
            .then(function(data){
                return new Promise((resolve,reject)=>
                {
                    let clearAllKeyPromises = fNameList.map(fName=>{
                        if (configDebug) {
                            console.info('clearVagueKeys fName:' + fName);
                        }
                        return clearVagueKeys(fName,redis);
                    });
                    Promise.all(clearAllKeyPromises).then(info=>{
                        return resolve(data);})
                });
        })
            .then(function(data){
                return resolve(data);
            })
            .catch(function(err){
                console.log('clear:' + err);
                reject(err);
        });
    });
}



function clearable(m,fn,fNameList,redis){
    return _.partial(withClear, m,getKey, fNameList ,fn,redis);
}
/**=====清空缓存实现结束=============>**/

module.exports = {
    /**
     * 声明式缓存
     * 使用方式：（前提是fn的最后一个参数是回调函数,回调函数第一个参数是err类似function(err,data1,data2,data3){}）
     * var cache = require('./cacheable');
     * var service  = require('../service/service1');
     * cache.cacheable(service,    'method1',       time);
     * @param m ：module对象
     * @param fn ：要缓存的函数名
     * @param opts   1000
     * key:缓存命名空间，time:过期时间
     */
    cacheable:function(m, objName, fName, time,redis){
        if(!m){
            throw 'm 不能为空';
        }
        if(!objName){
            throw 'objName 不能为空';
        }
        if(!fName){
            throw 'fName 不能为空';
        }
        if(!m[fName]){
            throw `${objName} 不存在${fName}函数`;
        }
        if(!time || isNaN(time)){//默认缓存一小时
            time = 60 * 60;
        }
        let key = objName+':'+fName;

        m[fName] = cacheable(m, m[fName],key,time,redis);
    },
    /**
     * 当调用某个方法时自动清空缓存
     * 使用方式：
     * var cache = require('./cacheable');
     * var service  = require('../service/service1');
     * cache.clear(service,    'method1','forum.service.service1');
     * @param m ：module对象
     * @param fn ：函数名
     * @param 缓存命名空间
     */
    clear:function(m, objKeyList, fName,redis){
        if(!m){
            throw 'm 不能为空';
        }
        if(!objKeyList){
            throw 'objName 不能为空';
        }
        if(!fName){
            throw 'fName 不能为空';
        }
        if(!m[fName]){
            throw 'm 不存在fn函数';
        }
        let key = objKeyList /*+':'+fName*/;
        m[fName] = clearable(m,m[fName],key,redis);
    },
    fromCache:fromCache,
    toCache  : toCache,
}
