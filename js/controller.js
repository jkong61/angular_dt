// By Jonathan Kong (101222148)
var app = angular.module("myApp", ['ngRoute','ngSanitize']);

app.controller("myController", function($scope, $http) 
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
        // console.log(data);
        $scope.products = response.data.products;
    });

    $scope.order = {};
    $scope.orders = [];
    $scope.form = {};

    // To set the nav bar links as active
    $scope.selected_index = 0;
    $scope.select = (index) =>
    {
        $scope.selected_index = index;
    }

    $scope.showform = false;
    $scope.showdetails = true;

    // Set Footer information
    const date = new Date();
    $scope.footer_year = `Copyright © ${date.getFullYear()}`;

    // Set Formlisteners
    $scope.submit = function(data)
    {

        $scope.order.id = generateRandomString();
        $scope.order.product = data;
        $scope.orders.push($scope.order);
        $scope.order = {};
        $scope.form.orderForm.$setPristine();
        $scope.form.orderForm.$setUntouched();

        console.log($scope.orders);
    }

    $scope.reset = function()
    {
        $scope.order = {};
        $scope.form.orderForm.$setPristine();
        $scope.form.orderForm.$setUntouched();
    }
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
app.controller("productController", function ($scope, $routeParams) 
{
    $('html,body').scrollTop(0);
    const id = $routeParams.productID;
    $scope.product = $scope.products[id-1];
    $scope.showform = false;
    $scope.showdetails = true;

});

// Controller for routing to order product
app.controller("orderController", function ($scope, $routeParams) 
{
    let product_id = $routeParams.productID;
    product_id = parseInt(product_id.split("_")[1]);
    $scope.product = $scope.products[product_id - 1];
    $scope.showdetails = false;
    $scope.showform = true;
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


function generateRandomString()
{
    return Math.random().toString(20).substr(2, 6)
}
