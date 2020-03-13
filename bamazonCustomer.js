const mysql = require('mysql');

let selectedProduct = {};
let selectedProductId = 0;
let selectedQty = 0;

// Get process.stdin as the standard input object.
let standard_input = process.stdin;

var connection = mysql.createConnection({
  host     : '127.0.0.1',
  user     : 'root',
  password : 'password',
  database : 'bamazon',
});

connection.connect(function (err) {
    if (err) throw err;
    listProducts();
    
});
//lists products available in bamazon store
function listProducts() {
    connection.query('SELECT * from products', function (error, results, fields) {
        if (error) throw error;
        for (let i=0; i < results.length; i++){
            console.log("Item ID: " + results[i].id + " | Product Name: "+ results[i].product_name + " | Department Name: " + results[i].department_name + "| Qty: " + results[i].stock_quantity);
            console.log("------------------------------------------------------------------------------------")
        }
        takeCustomerOrder();
    });
}
//matches entered id number to items in products table
function getProductById (id) {
    const query = connection.query('SELECT * FROM products WHERE ID = ? ',[id] ,function (error, results, fields) {
        if (error) throw error;
        if (results.length > 0) {
            selectedProduct = results[0];
            console.log("Item ID: " + results[0].id + " | Product Name: "+ results[0].product_name + " | Department Name: " + results[0].department_name + " | Price: " + results[0].price + " | Qty: " + results[0].stock_quantity);
            console.log("------------------------------------------------------------------------------------")
            console.log("Please enter quantity:")
        }else{
            console.log("Please enter a valid id!");
            selectedProductId = 0;
            selectedQty = 0;
            selectedProduct = {}; 
        }
      });
      
}
//checks if there is enough stock to complete customer order
function checkQtyAndUpdate(qty) {
    if (qty <= selectedProduct.stock_quantity) {
        connection.query("UPDATE products SET stock_quantity = stock_quantity - " + qty + "WHERE ID = " + selectedProductId, function(err, res) {
            if (err) throw err;
            console.log("Your total is:" + (qty * selectedProduct.price));
            selectedProductId = 0;
            selectedQty = 0;
            selectedProduct = {}; 
            console.log("Thank You!");
            process.exit();
          });
    }else{
        console.log("Not enough stock to complete order!");
        selectedQty = 0;
    }
}


function takeCustomerOrder() {
    
    // Set input character encoding.
    standard_input.setEncoding('utf-8');

    // Prompt user to input data in console.
    console.log("Please type product ID:");

    // When user input data and click enter key.
    standard_input.on('data', function (data) {

        // User input exit.
        if (data === 'exit\n') {
            connection.end();
            // Program exit.
            console.log("User input complete, program exit.");
            process.exit();
        } else {
            // Print user input in console.
            if (selectedProductId === 0) {
                selectedProductId = data;
                console.log('Product Selected : ' + selectedProductId);
                getProductById(selectedProductId);
            } else if (selectedProductId > 0 && selectedQty === 0) {
                selectedQty = data;
                checkQtyAndUpdate(selectedQty);                
                console.log('Qty Selected : ' + selectedQty);
            }
        }

    });
}