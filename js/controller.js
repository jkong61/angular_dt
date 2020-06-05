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
    $scope.showJumbotron = true;
    $scope.showSearch = false;

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
    .when('/trackorders', {
        templateUrl: "templates/orders_template.html",
        controller: "trackOrderController"
    })
    .when('/trackorders/:orderID', {
        templateUrl: "templates/orders_template.html",
        controller: "trackOrderController"
    })
    .when('/disclaimer', {
        templateUrl: "templates/disclaimer.html",
        controller: "disclaimerController"
    })
    .when('/search', {
        templateUrl: "templates/main_products_template.html",
        controller: "searchController"
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
    $scope.product = productData.getProduct(product_id);
    $scope.showdetails = false;
    $scope.showform = true;
    $scope.showsuccess = false;

});

// Controller for routing to order tracking
app.controller("trackOrderController", function ($scope, $routeParams, $http, $location, orderData) 
{
    $http.get('content/json/orderpage.json',["application/json"])
    .then((response) =>
    {
        $scope.page = response.data.page;
    });

    const orderID = $routeParams.orderID;
    if(orderID == undefined)
    {
        console.log("Empty order id in request");
        $scope.showsearchform = true;
    }
    else
    {
        const order = orderData.getOrder(orderID);
        if(order)
        {
            // Show orders info here.
            $scope.showOrderDetails = true;
            $scope.order = order;
            console.log(order);
        }
        else
        {
            $scope.showsearchform = true;
            $scope.error = `Order ${orderID} does not exist.`;
        }
    }

    // Function to search order
    $scope.searchOrder = (data) =>
    {
        if(data)
            $location.path(`/trackorders/${data}`);
        else
            $location.path(`/trackorders`);
    }
});

// Controller for routing to disclaimer
app.controller("disclaimerController", function ($scope,$http) 
{
    $http.get('content/json/disclaimer.json',["application/json"])
    .then((response) =>
    {
        $scope.page = response.data.disclaimer;
    });
});

// Controller for routing to disclaimer
app.controller("searchController", function ($scope, productData) 
{
    $scope.showJumbotron = false;
    $scope.showSearch = true;
    $scope.categories = productData.getCategories();
});

// Form Controller to handle logic of forms
app.controller("formController", function($scope, orderData, productData)
{
    let order = {};

    // Set Formlisteners
    $scope.submit = function(data, customerdetails)
    {
        let orderid = generateRandomString();
        order.orderid = orderid;
        order.product = data;
        order.customer = customerdetails;

        // Push order to master order list
        orderData.addOrder(order);
        // Reset order variable
        $scope.reset();

        // Change view to success
        $scope.$parent.$parent.showdetails = false;
        $scope.$parent.$parent.showform = false;
        $scope.$parent.$parent.showsuccess = true;
        $scope.$parent.$parent.orderinfo = orderData.getOrder(orderid);
        $scope.product = productData.getProduct($scope.orderinfo.product.anchor);
    }

    $scope.reset = function()
    {
        order = {};
        $scope.orderForm.$setPristine();
        $scope.orderForm.$setUntouched();
    }
});

// Set up Custom Card View Directive
app.directive('card',function(){
	
    var object = {};
    var card_object = function(scope,element,attributes)
    {
        scope.anchor = attributes.anchor;
        scope.imagelink = attributes.imagelink;
        scope.title = attributes.title;
        scope.description = attributes.description;
        scope.link = attributes.link;
    }
    object.restrict ='E';
    object.link = card_object;
    object.templateUrl = 'templates/card_view.html';
    object.scope = {};
	return object;
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


// Custome filter to capitalize the first letter of a string
app.filter("capitalize", function()
{
    return function(input) 
    {
        return input.charAt(0).toUpperCase() + input.slice(1)
    }
});


// Persistant global product data service
app.service("productData", function()
{    
    this.products = {};
    let categories = new Array();
    this.getProduct = function (data)
    {
        const index = this.products.map(e => e.anchor).indexOf(data);
        if(index == -1)
            return;
        return this.products[index];
    }

    this.getCategories = function ()
    {
        this.products.forEach(element =>
        {
            const category = element.category;
            if(!categories.includes(category))
                categories.push(category);
        })
        return categories
    }
});

// Persistant global order data service
app.service("orderData", function()
{    
    this.orders = 
    [
        {
            "orderid" : "abc",
            "product" : 
            {
                "title" : "Little Whales",
                "anchor" : "product_1",
                "imagelink" : "content/images/product_1.jpeg",
                "description" : "Product description that describes how nice this product is and how awesome it is.",
                "productlink" : "#!product/1",
                "price" : 10,
                "category" : "keychain",
                "fulldescription" : "Product description that describes how nice this product is and how awesome it is. The only difference is that there is a little bit more words to help me fill out this space with placeholder information. Just admire how nice this mountain looks like. Image obtained from w3schools."    
            }
        }
    ];

    this.addOrder = function(data)
    {
        if(data != null || data != undefined)
            this.orders.push(data);
    }

    this.getOrder = function(orderid)
    {
        const index = this.orders.map(e => e.orderid).indexOf(orderid);
        if(index == -1)
            return;
        return this.orders[index];
    }
});


// Auxiliary functions
function generateRandomString()
{
    return Math.random().toString(20).substr(2, 6)
}
