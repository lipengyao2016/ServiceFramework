

class RedisLock
{
    constructor()
    {

    }

    async lock(redis,lockKey,requestId,expireTime)
    {
        let lockRet = await redis.set(lockKey,requestId,'PX',expireTime,'NX');
        return lockRet == 'OK';
    }

    async unlock(redis,lockKey,requestId)
    {
        redis.defineCommand('releaseLock', {
            numberOfKeys: 1,
            lua: 'if redis.call(\'get\', KEYS[1]) == ARGV[1] then return redis.call(\'del\', KEYS[1]) else return 0 end'}
        );
        let unLockRet = await  redis.releaseLock(lockKey,requestId);

        return unLockRet == 1;
    }

}

let redisLock = new RedisLock();
module.exports = redisLock;



/*const redis = require('./redis');
let lockKey = 'payLockKey',requestId = 'payOk';
redisLock.lock(redis,lockKey,requestId,50*1000).then(data=>{
   console.log('redisLock.lock data:' + data);
});

redisLock.unlock(redis,lockKey,requestId ).then(data=>{
    console.log('redisLock.unlock data:' + data);
});*/
