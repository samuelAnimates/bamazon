//access environmental variables for username, password, host
require('dotenv').config({path: './envVar.env'});

//require mysql package
var mysql = require('mysql');

//require inquirer package
var inquirer = require("inquirer");

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


//app that starts the bamazon purchase process by displaying all items for sale
function appStart(){

	//first display all of the items available for sale. Include the ids, names, and prices of products for sale.
	console.log("<================ ALL AVAILABLE PRODUCTS ==================>");
	connection.query("SELECT * FROM products", function(err, response){

		if (err) throw err;
			
		// Log all results of the SELECT statement
		for (i=0; i<response.length; i++){
			console.log("\nID: " + response[i].item_id + "\tPRODUCT NAME: " + response[i].product_name + "\n\tDEPARTMENT: " + response[i].department_name + "\n\tPRICE:" + response[i].cost +"\n\tQUANTITY IN STOCK:" + response[i].stock_quantity);
		}

		console.log("<============ END OF AVAILABLE PRODUCTS ==============>");
		
		//calls on function prompt user with messages about their purchase
		promptUser();

	});

};

//function that prompts user with messages about their purchase
function promptUser(){

	var userSelection = null;

	connection.query("SELECT * FROM products", function(err, response) {
		if (err) throw err;
		
		var FOO = [];

		for (i=0; i<response.length; i++){

			FOO.push( String(response[i].item_id));

		}

		//The app should then prompts users with two messages.
		//The first asks them to select the ID of the product they would like to buy.
		inquirer.prompt({
		
				name: "selectItemByID",
				type: "list",
				message: "\nSelect the [ID] of the item you'd like to purchase:",
				choices: FOO
		
		}).then(function(answer) {
			
			userSelection = parseInt(answer.selectItemByID);

			//* The second message should ask how many units of the product they would like to buy	
			inquirer.prompt({
		
				name: "selectQuantity",
				type: "input",
				message: "How many would you like to purchase?",
		
			}).then(function(answer) {
			
				if ( parseInt(answer.selectQuantity) <= 0 || answer.selectQuantity === null || answer.selectQuantity === undefined){
					throw "ERROR: Something is wrong with that quantity. Please correct your input and try again with a different order."
				}

				else{
				 	checkStock( parseInt(answer.selectQuantity), userSelection);
				}

			});
		
		});

	});

};

function checkStock(requestedNum, requestedItemID){

	connection.query(
		"SELECT * FROM bamazondb.products WHERE item_id =" + requestedItemID,
		function(err, response){

			if (err) throw err;
			
			if (requestedNum <= response[0].stock_quantity){			
				updateDatabase(requestedNum, requestedItemID, response[0].cost, response[0].stock_quantity);
			}

			//throw an error if the store doesn't have enough stock to fulfill the order
			if  (requestedNum > response[0].stock_quantity)
				throw "ERROR: Something is wrong with your requested quantity. Please check the stock quantity and try again with a different order.";

		}
	
	);

};

function updateDatabase(requestedQuantity, requestedID, requestedItemCost, availableStock){

	var newStockNum = availableStock - requestedQuantity;

	//updating the SQL database to reflect the remaining quantity.
	connection.query(
    	"UPDATE bamazondb.products SET ? WHERE ?",
    	[
    		{
    			stock_quantity: newStockNum
			},
			{
				item_id: requestedID
			}
		],
		function(error) {
			//Once the update goes through, show the customer the total cost of their purchase.	
			console.log("YOUR TOTAL COST IS: " + (requestedQuantity * requestedItemCost).toFixed(2) );
		}
	);

};