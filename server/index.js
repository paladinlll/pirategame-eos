var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function (req, res) {
    res.send('pong');
});

var server = app.listen(process.env.PORT || 8080, function () {
  var host = server.address().address
  var port = server.address().port
  console.log("backend listening on port", port)
});