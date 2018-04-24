/**
 * Created by licp on 2016-11-28.
 */
var should = require('should'),
    utils = require('../.'),
    assert = require('assert');
/*    crypto = require('crypto');*/

/*var collection1 = 'test_collection_' + crypto.randomBytes(8).toString('hex'),
    collection2 = 'test_collection_' + crypto.randomBytes(8).toString('hex'),
    dbName = 'easy_mongo_test_' + crypto.randomBytes(8).toString('hex');*/

    describe('#uuid Test', function () {
        it('createUUID success', function () {
             var uuid = utils.createUUID();
             console.log(' createUUID uuid:',uuid);
            return  assert.notEqual(uuid ,null);
        });

        it('getUUIDInHref success', function () {
            var orgaHref = 'http://192.168.6.16:5003/api/v1.0.0/userOrganizations/eCyasd3xUf0ks6X7FVd4cA';
            var  organizationUUID = utils.getResourceUUIDInURL(orgaHref,'userOrganizations');
            console.log(' getUUIDInHref organizationUUID:',organizationUUID);
            return assert.notEqual(organizationUUID , null);
        });

        it('getResourceUUIDInURL success', function () {
            var departHref = 'http://192.168.6.16:5003/api/v1.0.0/userOrganizations/eCyasd3xUf0ks6X7FVd4cA/departments/7gI5zqq6n9sanfjh6ijeuA';
            var upLevelDepartmentUUID = utils.getResourceUUIDInURL(departHref,'departments');
            console.log(' getResourceUUIDInURL upLevelDepartmentUUID:',upLevelDepartmentUUID);
            return assert.notEqual(upLevelDepartmentUUID ,null);
        });
    });

/*
describe('#getUUIDInHref Test', function () {

});

describe('#getResourceUUIDInURL Test', function () {

});
*/

;
