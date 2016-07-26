angular.module("myApp").config(function($stateProvider, $urlRouterProvider) {
  // For any unmatched url, redirect to /home
  $urlRouterProvider.otherwise("/home");
  // Now set up the states
  $stateProvider
    .state('upload', {
      url: "/upload",
      templateUrl: "partials/upload.html",
      controller: "UploadController"
    })
  .state('home',{
    url: "/home",
    templateUrl: "partials/home.html",
    controller: "HomeController"
  })
  .state('process',{
    url: "/process",
    templateUrl: "partials/process.html",
    controller: "ProcessController"
  })
  .state('logs',{
    url: "/logs",
    templateUrl: "partials/logs.html",
    controller: "LogsController"
  })
  .state('metadata',{
    url: "/metadata/:hash",
    templateUrl: "partials/metadata.html",
    controller: "HashController"
  })
  .state('download',{
    url: "/download",
    templateUrl: "partials/download.html",
    controller: "DownloadController"
  })
  .state('load_to_mongo',{
    url: "/load_to_mongo",
    templateUrl: "partials/load.html",
    controller: "LoadController"
  })
});
