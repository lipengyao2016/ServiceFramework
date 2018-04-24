/**
 * Created by licp on 2016-10-11.
 */

const request = require('./request').request;
const utils = require('./utils');

exports.redirectGetRequest = function*(ctx, curUrl, newUrl,curHost,newHost) {

    let context = ctx;
    let result = yield request.getRequest(newUrl);

    let retBody = result.body;
    let retRes = result.res;

   // utils.replaceUrlHost(retBody,newHost,curHost);

    console.log('redirectGetRequest  status:' + retRes.statusCode +
        ' body :' + JSON.stringify(retBody));
    context.status = retRes.statusCode;
    context.body = retBody;

};

exports.redirectPostRequest = function*(ctx, curUrl, newUrl,paramsBody,curHost,newHost) {

    let context = ctx;
    let result = yield request.postRequest(newUrl,paramsBody);

    let retBody = result.body;
    let retRes = result.res;

   // utils.replaceUrlHost(retBody,newHost,curHost);

    console.log('redirectPostRequest  status:' + retRes.statusCode +
        ' body :' + JSON.stringify(retBody));
    context.status = retRes.statusCode;
    context.body = retBody;

};

exports.redirectDeleteRequest = function*(ctx, curUrl, newUrl) {

    let context = ctx;
    let result = yield request.deleteRequest(newUrl);

    let retBody = result.body;
    let retRes = result.res;

    console.log('redirectDeleteRequest  status:' + retRes.statusCode +
        ' body :' + JSON.stringify(retBody));
    context.status = retRes.statusCode;
    context.body = retBody;

};