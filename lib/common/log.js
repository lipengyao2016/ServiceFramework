var log4js = require('log4js');
var fs = require("fs");
var path = require("path");
var logConfig = require('../config/log4js');

// 加载配置文件
var objConfig = {
    "appenders": [
        {"type": "console", "category": "console"},
        {"type": "file", "filename": path.join(path.dirname(__dirname), logConfig.name), "category": logConfig.name}
    ],
    "replaceConsole": true,
    "levels": logConfig.levels
};

// 检查配置文件所需的目录是否存在，不存在时创建
checkAndCreateDir(path.dirname(objConfig.appenders[1]["filename"]));

// 目录创建完毕，才加载配置，不然会出异常
log4js.configure(objConfig);

exports.getLogger = function getLogger() {
    var log = log4js.getLogger(logConfig.name);
    return log;
};

//helper.writeDebug = function(msg){
//    if(msg == null)
//        msg = "";
//    logDebug.debug(msg);
//};
//
//helper.writeInfo = function(msg){
//    if(msg == null)
//        msg = "";
//    logInfo.info(msg);
//};
//
//helper.writeWarn = function(msg){
//    if(msg == null)
//        msg = "";
//    logWarn.warn(msg);
//};
//
//helper.writeErr = function(msg, exp){
//    if(msg == null)
//        msg = "";
//    if(exp != null)
//        msg += "\r\n" + exp;
//    logErr.error(msg);
//};

// 配合express用的方法
exports.use = function(app) {
    //页面请求日志, level用auto时,默认级别是WARN
    //var HTTP_LOG_FORMAT_DEV = ':method :url :status :response-time ms - :res[content-length]';
    var HTTP_LOG_FORMAT_DEV = ':method :url :status :response-time(ms)';
    app.use(log4js.connectLogger(log4js.getLogger(logConfig.name), {level:logConfig.httpLogLevel, format:HTTP_LOG_FORMAT_DEV}));
}

// 判断日志目录是否存在，不存在时创建日志目录
function checkAndCreateDir(dir){
    if(fs.existsSync(dir)){
        return true;
    }else{
        if(checkAndCreateDir(path.dirname(dir))){
            fs.mkdirSync(dir);
            return true;
        }
    }
}

//// 指定的字符串是否绝对路径
//function isAbsoluteDir(path){
//    if(path == null)
//        return false;
//    var len = path.length;
//
//    var isWindows = process.platform === 'win32';
//    if(isWindows){
//        if(len <= 1)
//            return false;
//        return path[1] == ":";
//    }else{
//        if(len <= 0)
//            return false;
//        return path[0] == "/";
//    }
//}