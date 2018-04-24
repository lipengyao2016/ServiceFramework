/**
 * Created by Administrator on 2016/12/17.
 */

"use strict";
const request = require('common-request').request;
const _ = require('lodash');


class DistritubeExtraTranction {
    constructor() {
        console.log(' DistritubeExtraTranction -->constructor  ' );
        this.failedPromises = [];

        this.httpMethod = {
            httpCreate  :0,
            httpModify  :1,
            httpDelete  :2,
        };

        this.httpMethodStr = ['create','modify','delete'];


    };

    getHttpMethod()
    {
        return this.httpMethod;
    }


/*    addSingleFailePromise(generator,context,data) {
        let failGeneFunc = generator.call(context,data);
        this.failedPromises.push(failGeneFunc);
    };

    *rollBack()
    {
        let ret =true;
        console.log('DistritubeExtraTranction-->rollBack sucedHrefs:',this.sucedHrefs);
        if(this.failedPromises.length > 0)
        {
            this.failedPromises.map((failGeneFunc,index)=>{
                console.log('DistritubeExtraTranction-->rollBack index:',index);
                yield* failGeneFunc;
            })
        }
        console.log('DistritubeExtraTranction-->rollBack ret:',ret);

        return ret;
    }*/


    addSingleFaileReq(href,data,method) {
        let req ={href,data,method};
        this.failedPromises.push(req);
    };

    getMethodStr(methodValue)
    {
        if(methodValue >= 0 && methodValue < this.httpMethodStr.length)
        {
            return this.httpMethodStr[methodValue];
        }
        else
        {
            return 'unknown';
        }
    }

    async rollBack()
    {
        let ret =true;
        console.log('DistritubeExtraTranction-->rollBack sucedHrefs:',this.sucedHrefs);


        if(this.failedPromises.length > 0)
        {
            for(let failGeneFunc of  this.failedPromises)
            {
                console.log('DistritubeExtraTranction-->rollBack method:'+ this.getMethodStr(failGeneFunc.method)
                    +' href:' + failGeneFunc.href + ' data:' + JSON.stringify(failGeneFunc.data));
                switch(failGeneFunc.method)
                {
                    //0:创建。
                    case this.httpMethod.httpCreate:
                    {
                        let createRes = await request.post(failGeneFunc.href,failGeneFunc.data);
                        if(createRes.statusCode != 201)
                        {
                            console.log('DistritubeExtraTranction-->rollBack create href:' + failGeneFunc.href
                                + ' failed.' );
                            ret =false;
                        }
                    }
                        break;

                    //1:修改。
                    case this.httpMethod.httpModify:
                    {
                        let updateRes = await request.post(failGeneFunc.href,failGeneFunc.data);
                        if(updateRes.statusCode != 200)
                        {
                            console.log('DistritubeExtraTranction-->rollBack update href:' + failGeneFunc.href
                                + ' failed.' );
                            ret =false;
                        }
                    }
                        break;

                    //2:删除。
                    case this.httpMethod.httpDelete:
                    {
                        let updateRes = await request.delete(failGeneFunc.href);
                        if(updateRes.statusCode != 204)
                        {
                            console.log('DistritubeExtraTranction-->rollBack delete href:' + failGeneFunc.href
                                + ' failed.' );
                            ret =false;
                        }
                    }
                        break;
                }
            }

        }
        console.log('DistritubeExtraTranction-->rollBack ret:',ret);

        return ret;
    }

}


module.exports = DistritubeExtraTranction;