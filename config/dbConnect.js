/*exports.dbConnect = function(dbUser, dbPassword) {
    const MongoClient = require('mongodb').MongoClient
        , assert = require('assert');

    var url = 'mongodb://' + dbUser + ':' + dbPassword + '@ds145790.mlab.com:45790/api';
    MongoClient.connect(url, (err,db) => {
        assert.equal(null, err);
        console.log('Connect correctly to MongoDV server: ' + dbUser);

        db.close();
    });
}*/
