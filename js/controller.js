// By Jonathan Kong (101222148)
var app = angular.module("myApp", ['ngRoute','ngSanitize']);

app.controller("myController", function($scope, $http, productData) 
{
    // Initialize Models
    $http.get('content/json/page.json',["application/json"])
    .then((response) =>
    {
        // console.log(data);
        $scope.page = response.data.page;
    });

    $http.get('content/json/products.json',["application/json"])
    .then((response) =>
    {
        $scope.products = response.data.products;
        productData.products = response.data.products;
    });

    $scope.form = {};

    // To set the nav bar links as active
    $scope.selected_index = 0;
    $scope.select = (index) =>
    {
        $scope.selected_index = index;
    }

    $scope.selected_index = 0;
    $scope.showform = false;
    $scope.showsuccess = false;
    $scope.showdetails = true;


    // Set Footer information
    const date = new Date();
    $scope.footer_year = `Copyright © ${date.getFullYear()}`;
});


// Configuration for routing
app.config(["$routeProvider", function ($routeProvider)
{
    $routeProvider
    .when('/product/:productID', {
        templateUrl: "templates/one_product_template.html",
        controller: "productController"
    })
    .when('/main', {
        templateUrl: "templates/main_products_template.html",
        controller: "myController"
    })
    .when('/order/:productID', {
        templateUrl: "templates/one_product_template.html",
        controller: "orderController"
    })
    .when('/success/:productID/:orderID', {
        templateUrl: "templates/one_product_template.html",
        controller: "orderSuccessController"
    })
    .when('/trackorders', {
        templateUrl: "templates/main_products_template.html",
        controller: "trackOrderController"
    })
    .when('/disclaimer', {
        templateUrl: "templates/disclaimer.html",
        controller: "disclaimerController"
    })
    .otherwise({
        redirectTo: "/main"
    })
}]);

// Controller for routing to product
app.controller("productController", function ($scope, $routeParams, productData) 
{
    $('html,body').scrollTop(0);
    const id = $routeParams.productID;
    $scope.product = productData.products[id-1];
    $scope.showform = false;
    $scope.showdetails = true;
    $scope.showsuccess = false;

});

// Controller for routing to order product
app.controller("orderController", function ($scope, $routeParams, productData) 
{
    let product_id = $routeParams.productID;
    product_id = parseInt(product_id.split("_")[1]);
    $scope.product = productData.products[product_id - 1];
    $scope.showdetails = false;
    $scope.showform = true;
    $scope.showsuccess = false;

});

// Controller for handling success forms
app.controller("orderSuccessController", function ($scope, $routeParams, productData, orderData) 
{
    $scope.showdetails = false;
    $scope.showform = false;
    $scope.showsuccess = true;

    const orderID = $routeParams.orderID;
    let product_id = $routeParams.productID;
    product_id = parseInt(product_id.split("_")[1]);
    $scope.product = productData.products[product_id - 1];

    const index = orderData.orders.map(e => e.id).indexOf(orderID);
    $scope.orderinfo = orderData.orders[index];
});

// Controller for routing to order tracking
app.controller("trackOrderController", function ($scope) 
{
    console.log("Tracking Order");
});

// Controller for routing to disclaimer
app.controller("disclaimerController", function ($scope,$http) 
{
    $http.get('content/json/disclaimer.json',["application/json"])
    .then((response) =>
    {
        $scope.page = response.data.disclaimer;
        console.log($scope.page);
    });
});

// Form Controller to handle logic of forms
app.controller("formController", function($scope, $location, orderData)
{
    let order = {};

    // Set Formlisteners
    $scope.submit = function(data)
    {
        let orderid = generateRandomString();
        order.id = orderid;
        order.product = data;

        // Push order to master order list
        orderData.addOrder(order);
        console.log(orderData);
        // Reset order variable
        order = {};

        // Reset form
        $scope.orderForm.$setPristine();
        $scope.orderForm.$setUntouched();


        $location.path(`/success/${data.anchor}/${orderid}`);
    }

    $scope.reset = function()
    {
        order = {};
        $scope.orderForm.$setPristine();
        $scope.orderForm.$setUntouched();
    }
});

// Set up Form directives
app.directive('myNoNumDirective', function()
{
    return {
        require: 'ngModel',
        link: function(scope, element, attr, mCtrl) 
        {
            function nameValidation(value) 
            {
                patt = new RegExp("[0-9]");
                if (patt.test(value)) 
                    mCtrl.$setValidity('noNumbers', false);
                else 
                    mCtrl.$setValidity('noNumbers', true);
                return value;
            }
            mCtrl.$parsers.push(nameValidation);
        }
    };
});

// Directive to check Regex
app.directive('regexDirective', function()
{
    return {
        require: 'ngModel',
        link: function(scope, element, attr, mCtrl) 
        {
            function passwordValidation(value) 
            {
                patt = new RegExp(attr.patt);
                if (patt.test(value)) 
                    mCtrl.$setValidity('matchRegex', true);
                else 
                    mCtrl.$setValidity('matchRegex', false);
                return value;
            }
            mCtrl.$parsers.push(passwordValidation);
        }
    };
});


// Persistant global product data
app.service("productData", function()
{    
    this.products = {};
});

// Persistant global order data
app.service("orderData", function()
{    
    this.orders = [];

    this.addOrder = function(data)
    {
        if(data != null)
            this.orders.push(data);
    }
});


// Auxiliary functions
function generateRandomString()
{
    return Math.random().toString(20).substr(2, 6)
}
