//access environmental variables for username, password, host
require('dotenv').config();

//require mysql package
var mysql = require('mysql');

//create connection to server of choice, as specified in env file
var connection = mysql.createConnection({
	host: process.env.DB_HOST,
	port: 3306,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: "bamazondb"
})

connection.connect(function(err) {
	if (err) throw err;
	appStart();
});

function appStart(){
	//first display all of the items available for sale. Include the ids, names, and prices of products for sale.
	promptUser();
}

function promptUser(){

	//6. The app should then prompt users with two messages.
	//* The first should ask them the ID of the product they would like to buy.
	//* The second message should ask how many units of the product they would like to buy
	checkStock();

}

function checkStock(){

	/*
	7. Once the customer has placed the order, your application should check if your store has enough of the product to meet the customer's request.
	If not, the app should log a phrase like `Insufficient quantity!`, and then prevent the order from going through.
	*/

	updateDatabase();	

}

function updateDatabase(){

	/*
	8. However, if your store _does_ have enough of the product, you should fulfill the customer's order.
   * This means updating the SQL database to reflect the remaining quantity.
   * Once the update goes through, show the customer the total cost of their purchase.
	*/	

}