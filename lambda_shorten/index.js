var config = require('./config.js');
var AWS = require('aws-sdk');
var mysql = require('mysql');

var Processor = {};
Processor.initializeConnection = function(callback) {
	console.log("initializeConnection: ");
	Processor.connection = mysql.createConnection({
		host : host,
		user : user,
		password : password,
		database : database
	});
	Processor.connection.connect(function(err) {
		if (err) {
			console.error("couldn't connect", err);
			callback(false);
		} else {
			console.log("mysql connected");
			callback(true);
		}
	});
};
Processor.disconnect = function() {
	Processor.connection.end(function(err) {
		console.log("Disconnect.");
	});
};

var ShortURL = new function() {

	var _alphabet = '23456789bcdfghjkmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ-_', _base = _alphabet.length;

	this.encode = function(num) {
		var str = '';
		while (num > 0) {
			str = _alphabet.charAt(num % _base) + str;
			num = Math.floor(num / _base);
		}
		return str;
	};

	this.decode = function(str) {
		var num = 0;
		for (var i = 0; i < str.length; i++) {
			num = num * _base + _alphabet.indexOf(str.charAt(i));
		}
		return num;
	};

};

exports.get_short = function(event, context) {

	// varify all params are posted
	if (!event.long_url) {
		console.error('invalid params');
		context.done(null, {
			error : 'Params are not valid',
			status : false
		});
		return;
	}
	Processor.initializeConnection(function(db_connected) {

		if (db_connected == false) {
			context.done(null, {
				error : 'could not connect to the database',
				status : false
			});
			return;
		}

		var data = {
			long_url : event.long_url,
			short_url : ""
		};

		var query = Processor.connection.query('INSERT INTO short_urls SET ?', data, function(err, result) {

			if (err == null) {
				console.log('success: inserted');
				// console.log(result);
				var short_url = ShortURL.encode(result.insertId);
				console.log("encode Number: " + short_url);
				console.log("get Number : " + ShortURL.decode(short_url));

				Processor.connection.query('UPDATE short_urls SET short_url = ? WHERE id = ? ', [ short_url, result.insertId ],
					function(err, result) {
						Processor.disconnect();
						context.done(null, {
							status : true,
							short_url : short_url
						});
					});

			} else {
				console.log('Errror: while inserting' + err);
				context.done(null, {
					error : 'error while inserting data',
					status : false
				});
			}
		});

	});

};

exports.get_long = function(event, context) {

	// varify all params are posted
	if (!event.short_url) {
		console.error('invalid params');
		context.done(null, {
			error : 'Params are not valid',
			status : false
		});
		return;
	}
	Processor.initializeConnection(function(db_connected) {

		if (db_connected == false) {
			context.done(null, {
				error : 'could not connect to the database',
				status : false
			});
			return;
		}

		var query = Processor.connection.query('SELECT long_url FROM short_urls WHERE short_url = ?', [ event.short_url ],
			function(err, result) {

				if (err == null) {
					console.log(result);
					if (result.length > 0) {
						context.done(null, {
							status : true,
							long_url : result[0]['long_url']
						});
					} else {
						context.done(null, {
							error : 'No record found',
							status : false
						});
					}

				} else {
					console.log('Errror: while inserting' + err);
					context.done(null, {
						error : 'error while inserting data',
						status : false
					});
				}
			});

	});

};

exports.decode = function(event, context) {
	console.log("get Number : " + ShortURL.decode(event.short_url));
}

// lambda-local -l index.js -h get_short -e data/input.js -t 60
// lambda-local -l index.js -h get_long -e data/input.js -t 60
