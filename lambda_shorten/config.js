var mode = 'live'; // local, live

if (mode == 'local') {

	host = "";
	user = "";
	password = "";
	database = "";

} else if (mode == 'live') {
	host = "insert RDS endpoint URL here";
	user = "Insert_Username_Here";
	password = "Insert_Password_Here";
	database = "Insert_RDS_DBName_Here";
}

module.exports = function() {
};
