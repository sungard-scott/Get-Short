// Set up environment specific configs
var app_config = 'production'; // staging or production
switch (app_config) {
case 'staging':
	window.app_config = {
		base_url : "http://localhost/lambda_shorten/html/short.html/",
		apiUrl : 'https://insertAPIurlHere',
	};
	break;

case 'production':
	window.app_config = {
		base_url : "http://localhost/lambda_shorten/html/short.html/",
		apiUrl : 'https://insertAPIurlHere/',
	};
	break;

default:
	window.app_config = {};
	$.tw.debug('Invalid environment specified for app initialization!');
	break;
}
