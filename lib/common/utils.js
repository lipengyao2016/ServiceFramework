/**
 * Copyright(C),
 * FileName:  utils.js
 * Author: sxt
 * Version: 1.0.0
 * Date: 2015/10/22  16:26
 * Description:
 */
"use strict";
var crypto = require('crypto');
var uuid = require('node-uuid');
//var chai = require('chai');
//var expect = chai.expect;

const moment = require('moment');

const _ = require('lodash');
var url = require('url');

var fs = require('fs');
var path = require("path");


exports.getUUIDInHref = function(href, reg, lastReg) {
    var serviceReg = new RegExp(reg);
    var serviceResult = serviceReg.exec(href);
    var subStr = href.substr(serviceResult['index'] + serviceResult[0].length);
    if(!lastReg){
        return subStr;
    }
    serviceReg = new RegExp(lastReg);
    serviceResult = serviceReg.exec(subStr);
    return subStr.substr(0, serviceResult['index']);
};
exports.getResourceUUIDInURL = (url,name)=>{
    let reg = new RegExp( name );
    let result = reg.exec(url);
    if( !result ) return null;
    let subStr = url.substr(result['index'] + result[0].length+1);
    result = (new RegExp('/')).exec(subStr);
    if(!result) return subStr;
    subStr = subStr.substr(0,result['index']);
    return subStr;
};

exports.getLastResourceUUIDInURL = (url)=>{
    let reg = /\/[\w]{22}$/;
    let result = reg.exec(url);
    if( !result ) return null;
    return result[0].substr(1);
};

exports.createUUID = ()=>{
    let uuid_md5 = null;
    do{
        let md5 = crypto.createHash('md5');
        uuid_md5 = md5.update(`${uuid.v1()}-${uuid.v4()}`).digest('base64');
    }while( uuid_md5.indexOf('/') != -1 || uuid_md5.indexOf('+') != -1);
    return uuid_md5.substr(0, uuid_md5.length-2);
};
exports.uuid2number = (uuid)=>{
    let number = Array.from(uuid).reduce((ret,char,i)=>{
        return ret + (char.charCodeAt(0)-"0".charCodeAt(0))*Math.pow(2,(i%19+1));
    },0);
    return _.padStart(number,8,'0');
}

var UUIDReg = new RegExp('[a-z0-9A-Z]{22}');
exports.checkUUID = (uuid)=>{
    if(UUIDReg.test(uuid)){
        return true;
    }
    return false;
};

exports.ifReturnTrue = function (value) {
    return value ? true : false;
};

exports.ifReturnStr = function (value, str) {
    return value ? value : (str ? str : '');
};

exports.ifReturnNum = function (value, num) {
    return value ? value : (num ? num : 0);
};
exports.ifReturnJson = function(value, json) {
    return value ? JSON.stringify(value) : (json ? json : "{}");
};


exports.parseUrlParam=function(href){
    var query,data = {};
    href=href.split('?');
    if(href.length>1){
        query=href[1];
        if (!query) return false;
        query = query.split('&');
        query.forEach(function (ele) {
            var tmp = ele.split('=');
            data[ decodeURIComponent( tmp[0] ) ] = decodeURIComponent( tmp[1] === undefined ? '' : tmp[1] );
        });
    }
    return data;
};

exports.convertStrToArray = function(value, speliter) {
    if(_.isArray(value) && value)
    {
        return value;
    }
    else if(_.isString(value) && value)
    {
        return  value.replace(/(\[)|(\])|(\")/g,"").split(speliter);
    }
    else
    {
        return null;
    }

};

exports.getUrlPath=function(href){
    var data ;
    let result=href.split('?');
    if(result.length>1){
         data = result[0];
    }
    else
    {
        data = href;
    }
    return data;
};

exports.convertDateTime = function(timeStr) {
    return  moment(timeStr).format('YYYY-MM-DD HH:mm:ss');
};


exports.getUrlInfo = function(urlStr) {
    return  url.parse(urlStr);
};

exports.replaceUrlHost =function (resourceJSON, oldHost, newHost) {

    // console.log('graftExpandResources start  resourceJSON:'+  JSON.stringify(resourceJSON) );

    if(_.isArrayLikeObject(resourceJSON))
    {
        resourceJSON.map((items,index)=>
        {
            // console.log('graftExpandResources list element  items:'+  JSON.stringify(items) );
            this.replaceUrlHost(resourceJSON[index],oldHost,newHost);
        });
        return;
    }

    _.keys(resourceJSON).map((item)=> {
        if (_.isString(resourceJSON[item]))
        {
             resourceJSON[item] =  resourceJSON[item].replace(oldHost,newHost);
        }
        else if (_.isObject(resourceJSON[item])) {
            //  console.log('graftExpandResources object element  items:'+  JSON.stringify(resourceJSON[item]) );
            this.replaceUrlHost(resourceJSON[item], oldHost, newHost);
        }
    });

};

exports.checkRequiredParams = function(obj,keys){
    let error = null;
    let s = keys.some( key =>{
        if( ! _.has(obj,key)){
            error = new Error();
            error.name = 'Error';
            error.status = 400;
            error.code = errorCodeTable.missingParam2Code( key );
            error.message = errorCodeTable.errorCode2Text( error.code );
            error.description = `Missing param '${key}'`;
            return true;
        }
    });
    if(error) throw error;
};

exports.encrypt = function(data, password){
    const cipher = crypto.createCipher('aes192', password);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
};
exports.decrypt = function(data, password){
    const decipher = crypto.createDecipher('aes192', password);
    var decrypted = decipher.update(data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

exports.removeNullProperties = function(resource,bUndefined =true){

    let nullKeys = [];
    _.keys(resource).map((item)=> {

        if(bUndefined)
        {
            if (typeof(resource[item]) == "undefined") {
                //console.log('removeNullProperties key is null value:' + item);
                nullKeys.push(item);
            }
        }
        else
        {
            if (_.isString(resource[item])) {

                if (_.isNil(resource[item]) || resource[item].length <= 0)
                {
                    //console.log('removeNullProperties key is null value:' + item);
                    nullKeys.push(item);
                }
            }
            else if (!resource[item])
            {
                //console.log('removeNullProperties key is null object:' + item);
                nullKeys.push(item);
            }
        }


    });

    nullKeys.forEach(item=>
    {
        delete resource[item];
    });

};




exports.RandomNumBoth = function (Min,Max){
    var Range = Max - Min;
    var Rand = Math.random();
    var num = Min + Math.round(Rand * Range); //四舍五入
    return num;
}


exports.MakeRandomNumber = function (Cnt)
{
    let result = '';
    let first = this.RandomNumBoth(1,9);
    result += first;
    for(let i = 1;i < Cnt; i ++)
    {
        let t = this.RandomNumBoth(0,9);
        result += t;
    }
    return result;
}

exports.splitTwoListDiff = function (oldObjList,newObjList)
{
   let result = {
       addResults : [],
       delResults  :[]
   };

    oldObjList.forEach(oldItem=>
    {
        //如果老的列表中记录在新的列表中找不到的话， 则是要删除掉的。
        if (newObjList.indexOf(oldItem) == -1)
        {
            result.delResults.push(oldItem);
        }
    });

    newObjList.forEach(newItem=>
    {
        //如果新的列表中记录在老的列表中找不到的话，则是要添加的。
        if(oldObjList.indexOf(newItem)== -1)
        {
           result.addResults.push(newItem);
        }
    });

    return result;
}

exports.getResourceUUIDExtraInURL = (url,name)=>{
    let firstIndex = url.indexOf(name);
    if( firstIndex== -1 ) return null;
    let lastIndex = url.indexOf('/',firstIndex + name.length);
    if(lastIndex == -1)
    {
        return url.substring(firstIndex + name.length,url.length -1);
    }
    else
    {
        return url.substring(firstIndex + name.length,lastIndex-1);
    }


};


exports.getAttrFromObj = (obj,key,def)=>{

    if(obj[key])
    {
        return obj[key];
    }
    else
    {
        return def;
    }

};

exports.getTimeStr = function (date,bHasSeperator) {
    let format = bHasSeperator ? 'YYYY-MM-DD HH:mm:ss':'YYYYMMDDHHmmss';
    let dateTime = moment(date).format(format);
    return dateTime;

}


exports.getDateStr = function (date,bHasSeperator) {
    let format = bHasSeperator ? 'YYYY-MM-DD':'YYYYMMDD';
    let dateTime = moment(date).format(format);
    return dateTime;
}

exports.addTimeToFileName = function (fileName) {

    let curDate = this.getTimeStr(new Date(),false);


    let fileStrs = fileName.split('.');
    if(fileStrs.length >=2)
    {
        return fileStrs[0]+ '_' + curDate + '.' + fileStrs[1];
    }
    else
    {
        return fileName + curDate;
    }

}

// 判断日志目录是否存在，不存在时创建日志目录
exports.checkAndCreateDir = function (dir){
    if(fs.existsSync(dir)){
        return true;
    }else{
        if(this.checkAndCreateDir(path.dirname(dir))){
            fs.mkdirSync(dir);
            return true;
        }
    }
}

exports.getSubStrs= function (srcStr,beginStr,endStr)
{
    let beginIndex = srcStr.indexOf(beginStr);
    if(beginIndex < 0)
    {
        return null;
    }
    if(!endStr)
    {
        return srcStr.substr(beginIndex)
    }
    else
    {
        let endIndex = srcStr.indexOf(endStr,beginIndex);
        if(endIndex < 0)
        {
            return null;
        }
        return srcStr.substr(beginIndex,endIndex -beginIndex);
    }

}


exports.copyObjSaveSomeAttrs = function (srcObj,saveAttrs){

    let destObj = {};
    for(let key in srcObj)
    {
        if(saveAttrs.indexOf(key) >= 0)
        {
            destObj[key] = srcObj[key];
        }
    }
    return destObj;
}

exports.convertFloatToInt = function (data){

    let test = 'sinle';
    test += 'lpy';
    return destObj;
}