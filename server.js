var express = require('express'),
    bodyparser = require('body-parser'),
    multiparty = require('connect-multiparty'),
    mongodb = require('mongodb'),
    objectId = require('mongodb').ObjectId,
    fs = require('fs');

var app = express();

//var db = mongodb.dbConnect('chien', '1234');

var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

// Connection URL 
var url = 'mongodb://chien:1234@ds145790.mlab.com:45790/api';
// Use connect method to connect to the Server 
var db = MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected correctly to server");

  db.close();
}); 

//body-parser
app.use(bodyparser.urlencoded({extended:true}));
app.use(bodyparser.json());
app.use(multiparty());

app.use(function(req, res, next) {

    res.setHeader("Access-Control-Allow-Origin", "*");    
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");    
    res.setHeader("Access-Control-Allow-Headers", "content-type");    
    res.setHeader("Access-Control-Allow-Credentials", true);    

    next();
});

var port = 8080;

app.listen(port, function() {
    console.log("Servidor na port " + port );
})

/*var db = new mongodb.Db(
    'api',
    new mongodb.Server('localhost', 27017, {}),//objeto de conexao
    {}
);
//mongodb://chien:1234@ds145790.mlab.com:45790/api
/*var bd = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'api'
});*/

app.get('/', function(req, res) {
    res.send({msg:'Ola'});
})

//URI + http
//POST (create)
app.post('/api', function(req, res) {

    var date = new Date();
    time_stamp = date.getTime();

    var url_imagem = time_stamp + '_' + req.files.arquivo.originalFilename; 

    var path_origem = req.files.arquivo.path;
    var path_destino = './uploads/' + url_imagem;

    fs.rename(path_origem, path_destino, function(err) {
        if(err) {
            res.status(500).json(err);
            return;
        }

        var dados = {
            url_imagem: url_imagem,
            titulo: req.body.titulo
        }

        db.open(function(err, mongoclient) {
            mongoclient.collection('postagens', function(err, collection) {
                collection.insert(dados, function(err, records) {
                    if(err) {
                        res.json(err);
                    } else {
                        res.json(records);
                    }
                    mongoclient.close();
                })
            })
        })
    })
})

//Get (ready)
app.get('/api', function(req, res) {
    db.open(function(err, mongoclient) {
        mongoclient.collection('postagens', function(err, collection) {
            collection.find().toArray(function(err, results) {
                if(err) {
                    res.json(err);
                } else {
                    res.status(200).json(results);
                }
                mongoclient.close();
            })
        })
    })
})

app.get('/imagem/:imagem', function(req, res) {
    var img = req.params.iamgem;

    fs.readFile('./uploads/'+img, function(err, content) {
        if(err) {
            res.status(400).json(err);
            return;
        }

        res.writeHead(200, { 'content-type' : 'image/jpg' });
        res.end(content);
    })
})

//Get ID (ready)
app.get('/api/:id', function(req, res) {
    db.open(function(err, mongoclient) {
        mongoclient.collection('postagens', function(err, collection) {
            collection.find(objectId(req.params.id)).toArray(function(err, results) {
                if(err) {
                    res.json(err);
                } else {
                    res.json(results);
                }
                mongoclient.close();
            })
        })
    })
})

//Put ID (update)
app.put('/api/:id', function(req, res) {

    db.open(function(err, mongoclient) {
        mongoclient.collection('postagens', function(err, collection) {
            collection.update(
                { _id : objectId(req.params.id) },//query
                { $push : {
                        comentarios : {
                            id_comentario : new objectId(),
                            comentario : req.body.comentario
                        }
                    }
                },
                {},
                function(err, records) {
                    if(err) {
                        res.json(err);
                    } else {
                        res.json(records);
                    }
                mongoclient.close();
                }
            );
        });
    });
});

//Delete ID (remove)
app.delete('/api/:id', function(req, res) {
    db.open(function(err, mongoclient) {
        mongoclient.collection('postagens', function(err, collection) {
            collection.update(
                {  },
                {
                    $pull : {
                        comentarios: { id_comentario : objectId(req.params.id) }
                    }
                },
                { multi: true },
                function(err, records) {
                    if(err) {
                        res.json(err);
                    } else {
                        res.json(records);
                    } 
                    mongoclient.close();
                }
            );
        });
    });
});