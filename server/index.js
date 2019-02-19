var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));

//Thiết lập kết nối tới Mongoose
var mongoose = require('mongoose');
var mongoDB = 'mongodb://127.0.0.1/piratesgame';
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const User = require('./models/user');

app.get('/', function (req, res) {
    res.send('pong');
});

app.post('/delegatecall/login', function (req, res) {   
    var gplusToken = req.body.gplusToken;
	var email = req.body.email;
	
	User.findOne({email: email})
	.then((existingUser) => {
		if (existingUser && gplusToken == existingUser.gToken) {
			return res.json({
				"success": true,
				"user": existingUser
			});	
		} else {
			request('https://www.googleapis.com/oauth2/v2/userinfo?access_token=' + gplusToken, function(err, r, body) {
			if (err) {
				res.status(400);
				return res.json({
					"message": err
				});				
			}

			if (r.statusCode != 200) {			
				res.status(400);
				return res.json({
					"message": 'Invalid access token: ' + body
				});				
			}
			else {
				var me;
				try { 
					me = JSON.parse(body);
				}
				catch (e) {
					res.status(400);
					return res.json({
						"message": 'Unable to parse user data: ' + e.toString()
					});				
				}
				
				if(existingUser){
					if (email == profile.emails[0].value) {
						existingUser.gToken = gplusToken;
						
						existingUser.save()
						.then(user => {
							return res.json({
								"success": true,
								"user": user
							});	
						});
					} else{
						res.status(400);
						return res.json({
							"message": 'Invalid email: ' + profile.emails[0].value
						});	
					}
				} else{
					new User({
						  gId: profile.id,
						  gToken: gplusToken,
						  email: profile.emails[0].value,
						  name: profile.name.familyName + ' ' + profile.name.givenName
					})
					.save()
					.then(user => {
						return res.json({
							"success": true,
							"user": user
						});	
					});
				}
			}
		});
		}	 
	});	
	//'https://www.googleapis.com/plus/v1/people/me?access_token=' + accessToken       
});

var server = app.listen(process.env.PORT || 8080, function () {
  var host = server.address().address
  var port = server.address().port
  console.log("backend listening on port", port)
});