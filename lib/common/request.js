var querystring = require('querystring');
var request = require('request');
var _ = require('lodash');
var qs = require('qs');
const http = require('http');
var keepAliveAgent = new http.Agent({keepAlive: true});

class Request {
    constructor(opt={}) {
        this.bLog = opt.bLog?opt.log:false;
    }

    getRequest(url, data = {},option = {}) {
        return new Promise((resolve, reject) => {
            let _startAt = process.hrtime();

            let reqHeader = _.clone(option);
            reqHeader["content-type"] = 'application/json;charset=UTF-8';
            request({
                headers: reqHeader,
                url: url,
                qs: data,
            /*    useQuerystring: false,
                qsStringifyOptions:{options:{ arrayFormat: 'brackets'}},*/
                //agent:keepAliveAgent
            }, (err, res, body) => {
                let statusCode = (res && res.statusCode) ? res.statusCode : 600;
                if (err) {
                    err.statusCode = statusCode;
                    reject(err);
                } else {
                    try {
                        let bodyJSON = JSON.parse(body);
                        res.statusCode = statusCode;
                        resolve({res: res, body: bodyJSON});
                    } catch (e) {
                        e.statusCode = 510;
                        //reject(e);
                        //console.log(e);
                        resolve({res: res, body: e});
                    }
                }
                let _endAt = process.hrtime();
                let ms = ((_endAt[0] - _startAt[0]) * 1e3 + (_endAt[1] - _startAt[1]) * 1e-6).toFixed(3);
                let query = _.isEmpty(data) ? '' : ('?' + qs.stringify(data, {encode: false}));
                if(this.bLog)
                    console.log(`get request url \x1b[33m${ms}\x1b[0m ms : ${url}${query}`);
            });
        });
    }

    postRequest(url, data = {},option = {}) {
        return new Promise((resolve, reject) => {
            let _startAt = process.hrtime();
            let reqHeader = _.clone(option);
            reqHeader["content-type"] = 'application/json;charset=UTF-8';


            request({
                headers: reqHeader,
                method: "POST",
                url: url,
                json: data
                //agent:keepAliveAgent
            }, (err, res, body) => {
                let statusCode = res.statusCode ? res.statusCode : 600;
                if (err) {
                    err.statusCode = statusCode;
                    reject(err);
                } else {
                    try {
                        let bodyJSON = body;
                        res.statusCode = statusCode;
                        resolve({res: res, body: bodyJSON});
                    } catch (e) {
                        e.statusCode = 510;
                        //reject(e);
                        //console.log(e);
                        resolve({res: res, body: e});
                    }
                }
                let _endAt = process.hrtime();
                let ms = ((_endAt[0] - _startAt[0]) * 1e3 + (_endAt[1] - _startAt[1]) * 1e-6).toFixed(3);
                if(this.bLog) {
                    console.log(`post request url \x1b[33m${ms}\x1b[0m ms : ${url}`);
                    console.log(data);
                }
            });
        });
    }

    deleteRequest(url,data,option = {}) {
        return new Promise((resolve, reject) => {
            let _startAt = process.hrtime();

            let reqHeader = _.clone(option);
            reqHeader["content-type"] = 'application/json;charset=UTF-8';

            request({
                headers: reqHeader,
                method: "DELETE",
                url: url
            }, (err, res, body) => {
                let statusCode = (res && res.statusCode) ? res.statusCode : 600;
                if (err) {
                    err.statusCode = statusCode;
                    reject(err);
                } else {
                    try {
                        let bodyJSON = JSON.parse(body);
                        res.statusCode = statusCode;
                        resolve({res: res, body: bodyJSON});
                    } catch (e) {
                        e.statusCode = 510;
                        //reject(e);
                        //console.log(e);
                        resolve({res: res, body: e});
                    }
                }
                let _endAt = process.hrtime();
                let ms = ((_endAt[0] - _startAt[0]) * 1e3 + (_endAt[1] - _startAt[1]) * 1e-6).toFixed(3);
                let query = _.isEmpty(data) ? '' : ('?' + qs.stringify(data, {encode: false}));
                if(this.bLog) {
                    console.log(`get request url \x1b[33m${ms}\x1b[0m ms : ${url}${query}`);
                }
            });
        });
    }

}
exports.Request = Request;
exports.request = new Request();

