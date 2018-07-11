const _ = require('lodash');


class BaseProxyTranction
{
    constructor(dbOperater)
    {
        this.knex = dbOperater;
    }

    async buildTraction(knex,businessFunc)
    {
        let context = this;
        let retData =await  knex.transaction(function (trx) {
            Promise.resolve('start').then(data=>{
                return businessFunc.call(context,trx);
            })
                .then(function (results) {
                    console.log('BaseProxyTranction --> buildTraction   results:' + JSON.stringify(results));
                    trx.commit(results);
                    return "success";
                })
                .catch(function (error) {
                    console.error('BaseProxyTranction --> buildTraction error :' + error);
                    trx.rollback(error);
                    // throw new Error(error);
                });
        })
            .then(
                inserts=> {
                    return inserts;
                }
            )
        return retData;
    }


    batchUpdate(knex,tableName,data,key,filterValues,trx)
    {
        if(filterValues.length > 0)
        {
            return knex(tableName).update(data).whereIn(key,filterValues).transacting(trx)
                .then((batchUpdateResults)=>{
                    console.log(`MetaMenuProxy -->  updateOperatorValid tableName:${tableName},` +
                        'batchUpdateResults :' + JSON.stringify(batchUpdateResults));
                    return batchUpdateResults;
                })
        }
        else
        {
            console.log(`BaseProxyTranction --> batchUpdate  no data,tableName:${tableName}`);
            return Promise.resolve('no batchUpdate');
        }
    }

    update(knex,tableName,data,trx)
    {
        if( (_.isArray(data) && data.length > 0) || (data && data.uuid ) )
        {
            let updatePromise ;
            if(_.isArray(data))
            {
                let allUpdateReqs = data.map(item=>(knex(tableName).update(item)
                    .where('uuid', item.uuid).transacting(trx)) );
                updatePromise =  Promise.all(allUpdateReqs);
            }
            else
            {
                updatePromise = knex(tableName).update(data).where('uuid', data.uuid).transacting(trx);
            }
            return updatePromise.then((updateResults)=>{
                console.log(`BaseProxyTranction --> update  tableName:${tableName},updateResults :` + JSON.stringify(updateResults));
                return updateResults;
            })
        }
        else
        {
            console.log(`BaseProxyTranction --> update  no data,tableName:${tableName}`);
            return Promise.resolve('no updateData');
        }
    }


    insert(knex,tableName,data,trx)
    {
        if( (_.isArray(data) && data.length > 0) || (data && data.uuid ) )
        {
            return knex(tableName).insert(data).transacting(trx).then((insertsResults)=>{
                console.log(`BaseProxyTranction --> insert tableName:${tableName},` +
                    'insertsResults :' + JSON.stringify(insertsResults));
                return insertsResults;
            })
        }
        else
        {
            console.log(`BaseProxyTranction --> insert  no data !!!,tableName:${tableName}:`);
            return Promise.resolve('no insertData');
        }
    }

    delete(knex,tableName,key,filterValues,trx)
    {
        if( (_.isArray(filterValues) && filterValues.length > 0) || (filterValues ) )
        {
            let delPromise;
            if(_.isArray(filterValues))
            {
                delPromise = knex(tableName).delete().whereIn(key,filterValues).transacting(trx);
            }
            else
            {
                delPromise = knex(tableName).delete().where(key,filterValues).transacting(trx);
            }

            return delPromise.then((delResults)=>{
                console.log(`BaseProxyTranction --> delete tableName:${tableName},` +
                    'delResults :' + JSON.stringify(delResults));
                return delResults;
            })
        }
        else
        {
            console.log(`BaseProxyTranction --> delete  no data,tableName:${tableName}`);
            return Promise.resolve('no deleteData');
        }
    }
}


module.exports = BaseProxyTranction;
