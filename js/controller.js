// By Jonathan Kong (101222148)

var app = angular.module("myApp", ['ngRoute','ngSanitize']);

app.controller("myController", function($scope, $http) 
{
    // Initialize Models
    $http.get('content/json/page.json').then((data) =>
    {
        console.log(data);
        $scope.page = data['data']['page'];
    });

    $http.get('content/json/products.json').then((data) =>
    {
        // console.log(data);
        $scope.products = data['data']['products'];
    });

    // To set the nav bar links as active
    $scope.selected_index = 0;
    $scope.select = (index) =>
    {
        $scope.selected_index = index;
    }

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
    const id = $routeParams.productID;
    $scope.product = $scope.products[id-1];
});

app.controller("disclaimerController", function ($scope,$http) 
{
    $http.get('content/json/disclaimer.json').then((data) =>
    {
        $scope.page = data['data']['disclaimer'];
    });

});