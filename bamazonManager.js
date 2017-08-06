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

function appStart(){
	inquirer.prompt({
		
		name: "selectFunction",
		type: "list",
		message: "\nSelect wich action you'd like to complete:",
		choices: ["View products for sale.", "View low inventory.","Add to inventory.","Add new product.",]
	
	}).then(function(answer){

		if (answer.selectFunction === "View low inventory."){
			viewLow();
		}

		else if (answer.selectFunction === "Add to inventory."){
			addToInventory();
		}

		else if (answer.selectFunction === "Add new product."){
			addProduct();
		}

		else{
			displayItems();
		}

	});
}

//app that starts the bamazon purchase process by displaying all items for sale
function displayItems(){

	//first display all of the items available for sale. Include the ids, names, and prices of products for sale.
	console.log("<================ ALL AVAILABLE PRODUCTS ==================>");
	connection.query("SELECT * FROM products", function(err, response){

		if (err) throw err;
			
		// Log all results of the SELECT statement
		for (i=0; i<response.length; i++){
			console.log("\nID: " + response[i].item_id + "\tPRODUCT NAME: " + response[i].product_name + "\n\tDEPARTMENT: " + response[i].department_name + "\n\tPRICE:" + response[i].cost +"\n\tQUANTITY IN STOCK:" + response[i].stock_quantity);
		}

		console.log("<============ END OF AVAILABLE PRODUCTS ==============>");

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

function viewLow(){

	connection.query(
		"SELECT * FROM bamazondb.products WHERE stock_quantity<5",
		function(err, response){

			if (err) throw err;
			
			else {
				console.log(response);
			}

		}
	
	);

};

function addProduct(){

	inquirer.prompt([{
		name: "productName",
		type: "prompt",
		message: "\nEnter the name of item you'd like to add:"
	}, {
		name: "productDepartment",
		type: "prompt",
		message: "\nEnter the name of the item's department:"
	}, {
		name: "productCost",
		type: "prompt",
		message: "\nPlease enter the cost of the item."
	}, {
		name: "productQuantity",
		type: "prompt",
		message: "\nPlease enter the quantity of the item in stock"
	}]).then(function(answer) {

		//updating the SQL database to reflect the remaining quantity.
		connection.query(
	    	"INSERT INTO bamazondb.products SET ?",
	    	[
		    	{
		    		stock_quantity: parseInt(answer.productQuantity),
		    		product_name: answer.productName,
		    		department_name: answer.productDepartment,
		    		cost: answer.productCost
		    	}
	    	],
			function(error) {
				if (error){
					throw error;	
				} 
				//Once the update goes through, log a message
				console.log("\nADDED PRODUCT SUCCESSFULLY.");
			}
		);

	});

};

//app should display a prompt that will let the manager "add more" of any item currently in the store.
function addToInventory(){
	

		inquirer.prompt([
			{
				name: "selectItemByID",
				type: "prompt",
				message: "\nSelect the [ID] of the item you'd like to update:",
			},
			{
				name: "howMuch",
				type: "prompt",
				message: "\nWhat Quantity of this item would you like to add to the inventory?",
			}
		]).then(function(answer) {
			
			var userSelection = parseInt(answer.selectItemByID);
			var addStock = parseInt(answer.howMuch);

			connection.query(
		    	"UPDATE bamazondb.products SET ? WHERE ?",
		    	[
		    		{
		    			stock_quantity: stock_quantity + addStock
					},
					{
						item_id: userSelection
					}
				],
				function(error) {
					//Once the update goes through, show the customer the total cost of their purchase.	
					console.log("UPDDATED");
				}
			);


		});

	};