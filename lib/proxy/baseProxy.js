/**
 * Created by Administrator on 2017/2/20.
 */
"use strict";
const request = require('common-request').request;
const _ = require('lodash');

class BaseProxy {
    constructor(resourceName,serviceName,serverResourcePath) {
       this.resourceName = resourceName;
       this.serviceName = serviceName;
       this.serverResourcePath = serverResourcePath;
       this.resourceUrl = `${this.serverResourcePath}/${resourceName}`;
       console.log(`BaseProxy:${this.resourceName}-->constructor ${this.resourceUrl}`);
    };

    async execute(actionName,data,method = 'GET')
    {
        let actionUrl = `${this.serverResourcePath}/${actionName}`;
        console.log(`BaseProxy:${this.resourceName}-->execute ${actionUrl}`);
        let ret ;
        let bSuced = false;
        if(method == 'POST')
        {
            ret = await request.post(actionUrl,data);
        }
        else if(method == 'GET')
        {
            ret = await request.get(actionUrl,data);
        }
        if(ret.statusCode == 200 || ret.statusCode == 201)
        {
            console.log('create url:' + actionUrl + ',data:' + JSON.stringify(ret.body,null,2));
            return ret.body;
        }
        else
        {
            console.error(`${this.resourceName}-->execute ${actionUrl} err:${JSON.stringify(ret.body)}`);
            let error = new Error(); error.status = ret.statusCode;
            _.keys(ret.body).map(key=>error[key]=ret.body[key]);
            throw error;
        }
    }

    async create(data,disTran)
    {
        console.log(`BaseProxy:${this.resourceName}-->create ${this.resourceUrl}`);
        let ret = await request.post(this.resourceUrl,data);
        if(ret.statusCode == 201)
        {

            console.log('create url:' + this.resourceUrl + ',data:' + JSON.stringify(ret.body,null,2));

            if(disTran)
            {
                disTran.addSingleFaileReq(ret.body.href,{},disTran.getHttpMethod().httpDelete);
            }

            return ret.body;
        }
        else
        {
            console.error(`${this.resourceName}-->create err:${JSON.stringify(ret.body)}`);
            let error = new Error(); error.status = ret.statusCode;
            _.keys(ret.body).map(key=>error[key]=ret.body[key]);
            throw error;
        }
    }


    async batchCreate(data,disTran)
    {
        let batchCreateUrl = this.resourceUrl + '/batchCreate';
        console.log(`BaseProxy:${this.resourceName}-->batchCreate ${batchCreateUrl}`);
        let ret = await request.post(batchCreateUrl,data);
        if(ret.statusCode == 201)
        {
            if(disTran)
            {
                ret.body.map(item=>{
                    disTran.addSingleFaileReq(item.href,{},disTran.getHttpMethod().httpDelete);
                });
            }

            return ret.body;
        }
        else
        {
            console.error(`${this.resourceName}-->create err:${JSON.stringify(ret.body)}`);
            let error = new Error(); error.status = ret.statusCode;
            _.keys(ret.body).map(key=>error[key]=ret.body[key]);
            throw error;
        }
    }


    async list(qs)
    {
        console.log(`BaseProxy:${this.resourceName}-->list ${this.resourceUrl}`);
        let ret = await request.get(this.resourceUrl,qs);
        if(ret.statusCode == 200)
        {
            return ret.body;
        }
        else
        {
            console.error(`${this.resourceName}-->list err:${JSON.stringify(ret.body)}`);
            let error = new Error(); error.status = ret.statusCode;
            _.keys(ret.body).map(key=>error[key]=ret.body[key]);
            throw error;
        }
    }

    async listAll(qs)
    {
        let listAllUrl = this.resourceUrl + '/listAll';
        console.log(`BaseProxy:${this.resourceName}-->listAll ${listAllUrl}`);
        let ret = await request.get(listAllUrl,qs);
        if(ret.statusCode == 200)
        {
            return ret.body;
        }
        else
        {
            console.error(`${this.resourceName}-->listAll err:${JSON.stringify(ret.body)}`);
            let error = new Error(); error.status = ret.statusCode;
            _.keys(ret.body).map(key=>error[key]=ret.body[key]);
            throw error;
        }
    }


    async update(url,data,disTran,rollData)
    {
        console.log(`BaseProxy:${this.resourceName}-->update ${url}`);
        let ret = await request.post(url,data);
        if(ret.statusCode == 200)
        {
            if(disTran)
            {
                disTran.addSingleFaileReq(url,rollData,disTran.getHttpMethod().httpModify);
            }

            return ret.body;
        }
        else
        {
            console.error(`${this.resourceName}-->update err:${JSON.stringify(ret.body)}`);
            let error = new Error(); error.status = ret.statusCode;
            _.keys(ret.body).map(key=>error[key]=ret.body[key]);
            throw error;
        }
    }


    async delete(url,disTran,rollData)
    {
        console.log(`BaseProxy:${this.resourceName}-->delete ${url}`);
        let ret = await request.delete(url);
        if(ret.statusCode == 204)
        {
            if(disTran)
            {
                disTran.addSingleFaileReq(url,rollData,disTran.getHttpMethod().httpCreate);
            }
            return ret.body;
        }
        else
        {
            console.error(`${this.resourceName}-->delete err:${JSON.stringify(ret.body)}`);
            let error = new Error(); error.status = ret.statusCode;
            _.keys(ret.body).map(key=>error[key]=ret.body[key]);
            throw error;
        }
    }

}

module.exports = BaseProxy;