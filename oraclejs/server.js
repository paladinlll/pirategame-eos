var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
const eosjs = require('eosjs');

var bigInt = require("big-integer");
var crypto = require('crypto');
// const fetch = require('node-fetch');


EOS_CONFIG = {
    contractName: "pirategame", // Contract name
    contractSender: "pirategame", // User executing the contract (should be paired with private key)
    clientConfig: {
      //keyProvider: ["EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV", "EOS5mWCvACXWAzsza92nTsjBB1qEm7THaYyNzRXSwRYvu1H37gmfc"], // Your private key
      //keyProvider: "EOS5mWCvACXWAzsza92nTsjBB1qEm7THaYyNzRXSwRYvu1H37gmfc",
      binaryen: require('binaryen'),
      httpEndpoint: 'http://127.0.0.1:7777', // EOS http endpoint
      expireInSeconds: 60,
      broadcast: true,
      verbose: false, 
      debug: false,
      sign: true
    }
}

// options = {
//     authorization: 'pirategamealice@active',
//     broadcast: true,
//     sign: true,
//     keyProvider: "EOS5mWCvACXWAzsza92nTsjBB1qEm7THaYyNzRXSwRYvu1H37gmfc",
//   }

EOS_CONFIG.clientConfig.keyProvider = function() {
    return ['5JhTPDSe9ugHomFnhMgAdzzE2HniuR8rG3SyzzqvQrgJNPC4685'];
}

eos = eosjs(EOS_CONFIG.clientConfig)
//var keyProvider = 'EOS5mWCvACXWAzsza92nTsjBB1qEm7THaYyNzRXSwRYvu1H37gmfc'

app.get('/', function (req, res) {
    eos.getBlock({block_num_or_id: 1}).then(result => res.send(result))   
});

app.get('/pirategame/info/:id', function (req, res) {
    try{
        var id = bigInt(req.params.id);
    } catch (e){
        return res.json({"error": 2});
    }

    var scope = EOS_CONFIG.contractSender;
    var code = EOS_CONFIG.contractName;
    var table = "game";
    var table_key = "key";
    eos.getTableRows({
        scope,
        code,
        table,
        table_key,        
        "lower_bound": id,//.add(-1),
        "upper_bound": id.add(1),
        // key_type: 'i64',
        limit:1,
        json: true
    }).then((value) => {              
        console.log(value);
        if (value.rows.length > 0){
            res.json(value.rows[0]);
        } else{
            res.json({"error": 3});
        }
        
    }).catch((reason) => {            
        console.log(reason);
        res.json({"error": 1});
    }); 
});

app.post('/pirategame/newgame', function (req, res) {
   
    var formPlayers = req.body.players;
    var formGameId = req.body.gameId;
    
    var jPlayers = JSON.parse(formPlayers);
    if(jPlayers == null || jPlayers.length < 3){
        res.status(400);
        return res.json({
            "message": "Invalid players",
        });
    }

    var gid = null;
    try{
        if(formGameId.length > 0){
            gid = bigInt(formGameId);
        }
    } catch (e){
        
    }

    if(gid == null){
        res.status(400);
        return res.json({
            "message": "Bad request",
        });
    }

    
    eos.contract(EOS_CONFIG.contractName).then((contract) => {
        var p1 = new Promise(function(resolve, reject) {            
            setTimeout(function() {
                reject('Timeout Exception!');
            }, 8000);

            // contract.newaccount({
            //     "owner": "tttt",
            //     "passwd": 1234
            // }, {authorization : [EOS_CONFIG.contractSender]}
            
            contract.create({
                "gameId": formGameId,
                "players": jPlayers,
                "bidder": EOS_CONFIG.contractSender, 
                "amount": "1 EOS",                
            }, {authorization : [EOS_CONFIG.contractSender]}  
            ).then((r) => {             
                resolve(r);
            }).catch((err) => {            
                reject(err);
            })      
        });                   
        p1.then((value) => {            
            console.log(value);
            var transaction_id = value.transaction_id;            
            res.status(200);
            return res.json({
                "codeGameAddress":formGameId,
                "codeGameTxAddress":transaction_id,
            });
        }).catch((reason) => {            
            console.log(reason);
            res.status(400);
            return res.json({
                "message": "Bad request",
            });
        });      
    }).catch((err) => {
        console.log('\nCaught exception: ' + err);
        res.status(400);
        return res.json({
            "message": "Bad request",
        });
    })        
});

app.post('/pirategame/action/leadervote', function (req, res) {
    console.log("leadervote");
    var formPlayer = req.body.player;
    var formGameId = req.body.gameId;
    var formVote = parseInt(req.body.vote);

    var gid = null;
    try{
        if(formGameId.length > 0){
            gid = bigInt(formGameId);
        }
    } catch (e){
        
    }

    if(gid == null){
        res.status(400);
        return res.json({
            "message": "Bad request",
        });
    }
    
    eos.contract(EOS_CONFIG.contractName).then((contract) => {
        var p1 = new Promise(function(resolve, reject) {            
            setTimeout(function() {
                reject('Timeout Exception!');
            }, 8000);

            contract.leadervote({
                "gameId": formGameId,
                "player": formPlayer,
                "v": formVote,                               
            }, {authorization : [EOS_CONFIG.contractSender]}  
            ).then((r) => {             
                resolve(r);
            }).catch((err) => {            
                reject(err);
            })      
        });                   
        p1.then((value) => {            
            console.log(value);
            var transaction_id = value.transaction_id;            
            res.status(200);
            return res.json({
                "codeGameAddress":formGameId,
                "codeGameTxAddress":transaction_id,
            });
        }).catch((reason) => {            
            console.log(reason);
            res.status(400);
            return res.json({
                "message": "Bad request",
            });
        });      
    }).catch((err) => {
        console.log('\nCaught exception: ' + err);
        res.status(400);
        return res.json({
            "message": "Bad request",
        });
    })
});

app.post('/pirategame/action/decision', function (req, res) {
    console.log("leadervote");
    var formPlayer = req.body.player;
    var formGameId = req.body.gameId;
    var formDecisions = req.body.decisions;
    
    
    var jDecisions = JSON.parse(formDecisions);
    if(jDecisions == null){
        res.status(400);
        return res.json({
            "message": "Invalid decisions",
        });
    }
    var hexDecisions = '';
    for (var i = 0; i < jDecisions.length; i++) {
        var hex = (jDecisions[i] & 0xff).toString(16);
        hex = (hex.length === 1) ? '0' + hex : hex;
        hexDecisions += hex;
    }

    console.log(hexDecisions);
    //res.send('trigger-judgement');
    //return;
    var gid = null;
    try{
        if(formGameId.length > 0){
            gid = bigInt(formGameId);
        }
    } catch (e){        
    }
    
    eos.contract(EOS_CONFIG.contractName).then((contract) => {
        var p1 = new Promise(function(resolve, reject) {            
            setTimeout(function() {
                reject('Timeout Exception!');
            }, 8000);

            contract.decision({
                "gameId": formGameId,
                "player": formPlayer,
                "d": jDecisions,                               
            }, {authorization : [EOS_CONFIG.contractSender]}  
            ).then((r) => {             
                resolve(r);
            }).catch((err) => {            
                reject(err);
            })      
        });                   
        p1.then((value) => {            
            console.log(value);
            var transaction_id = value.transaction_id;            
            res.status(200);
            return res.json({
                "codeGameAddress":formGameId,
                "codeGameTxAddress":transaction_id,
            });
        }).catch((reason) => {            
            console.log(reason);
            res.status(400);
            return res.json({
                "message": "Bad request",
            });
        });      
    }).catch((err) => {
        console.log('\nCaught exception: ' + err);
        res.status(400);
        return res.json({
            "message": "Bad request",
        });
    })
});

app.post('/pirategame/action/decisionvote', function (req, res) {
    console.log("leadervote");
    var formPlayer = req.body.player;
    var formGameId = req.body.gameId;
    var formVote = parseInt(req.body.vote);

    var gid = null;
    try{
        if(formGameId.length > 0){
            gid = bigInt(formGameId);
        }
    } catch (e){
        
    }

    if(gid == null){
        res.status(400);
        return res.json({
            "message": "Bad request",
        });
    }
    
    eos.contract(EOS_CONFIG.contractName).then((contract) => {
        var p1 = new Promise(function(resolve, reject) {            
            setTimeout(function() {
                reject('Timeout Exception!');
            }, 8000);

            contract.decisionvote({
                "gameId": formGameId,
                "player": formPlayer,
                "v": formVote,                               
            }, {authorization : [EOS_CONFIG.contractSender]}  
            ).then((r) => {             
                resolve(r);
            }).catch((err) => {            
                reject(err);
            })      
        });                   
        p1.then((value) => {            
            console.log(value);
            var transaction_id = value.transaction_id;            
            res.status(200);
            return res.json({
                "codeGameAddress":formGameId,
                "codeGameTxAddress":transaction_id,
            });
        }).catch((reason) => {            
            console.log(reason);
            res.status(400);
            return res.json({
                "message": "Bad request",
            });
        });      
    }).catch((err) => {
        console.log('\nCaught exception: ' + err);
        res.status(400);
        return res.json({
            "message": "Bad request",
        });
    })
});

var server = app.listen(7070, function () {
  var host = server.address().address
  var port = server.address().port
  console.log("Oraclejs listening on port 7070...")

  
  //const myUnit64 = bigInt(Buffer.from(crypto.randomBytes(8)).toString('hex'), 16);
  //console.log(myUnit64.toString())
});