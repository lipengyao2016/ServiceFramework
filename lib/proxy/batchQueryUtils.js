/**
 * Created by Administrator on 2017/2/7.
 */
"use strict";
const utils= require('../common/utils');
const _ = require('lodash');
const request = require('common-request').request;

class BatchQueryUtils {
    constructor() {

        console.log(' BatchQueryUtils -->constructor start.');
        this.max_array_len = 100;
    };

    async batchQuery(reqURL,query,external_max_array_len)
    {
        let max_array_len = external_max_array_len ? external_max_array_len : this.max_array_len;
        let bigArrayKey ;
        for(let key in query)
        {
            let value = query[key];
            if(_.isArray(value) && value.length > max_array_len)
            {
                bigArrayKey = key;
                break;
            }
        }


        if(!bigArrayKey)
        {
            /** 2017/7/25 如果没有设置最大数量，则使用默认的最大数量，否则使用其设置的数量。
             lpy-modifyed 防止limit设置为0时，用户只需要取个数时，也返回数据的问题。
             */
            if(!query.limit)
            {
                query.limit = max_array_len;
            }

            let normlRes =  await request.get(reqURL,query);
            return normlRes.body;
        }
        else
        {
            console.log('batchQuery found bigArrayKey:' + bigArrayKey + ' value.length:' + query[bigArrayKey].length);
            let bigArrayValue = query[bigArrayKey];
            delete query[bigArrayKey];
            let singleBigChunks = _.chunk(bigArrayValue,max_array_len);
            let singleQueryReq = singleBigChunks.map(singleChunk=>{
                let singleQs = _.clone(query);
                singleQs[bigArrayKey] = singleChunk;
                singleQs.offset = 0;
                singleQs.limit = max_array_len;

                return  request.get(reqURL,singleQs);
            });

            let singleQueryRes = await singleQueryReq;

            let result =singleQueryRes.reduce((queryRes,{res,body},index)=>{
                if(res.statusCode == 200)
                {
                    if(!queryRes.items)
                    {
                        queryRes = body;
                    }
                    else
                    {
                        queryRes.size += body.size;
                        if(body.items && body.items.length > 0)
                        {
                            queryRes.items = queryRes.items.concat(body.items);
                            console.log('BatchQueryUtils batchQuery  size:',queryRes.size);
                        }
                    }
                }
                else
                {
                    console.log('BatchQueryUtils batchQuery failed!! singleBigChunks:',singleBigChunks[index]);
                }

                return queryRes;

            },{});

            return result;
        }


    }

}

exports.BatchQueryUtils = BatchQueryUtils;

exports.batchQueryUtils = new BatchQueryUtils();
