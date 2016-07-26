angular.module("myApp").controller("HashController",['$scope','$http','$stateParams','backendIp',function($scope,$http,$stateParams,backendIp){
  $scope.params = $stateParams;
  this.backendIp=backendIp;
  $scope.process_file_response="";
  $scope.download_url = "http://"+backendIp+"/api/v1/file/get?file_hash="+encodeURI($scope.params['hash']);
  $scope.json = {};
  $scope.json.object = {"status": "Waiting for server"};
  $scope.refresh_metadata = function(){
    $http({method: 'GET',url: "http://"+backendIp+"/api/v1/metadata", params: {'file_hash': $scope.params['hash']}}).then(function(response){
      var file_metadata = response.data;

      $scope.json = {};
      try{
        $scope.json.string = JSON.stringify(file_metadata);
        $scope.json.object = JSON.parse($scope.json.string);
      }
      catch(ex){
        console.log(ex);
      }
    });
  };
  $scope.refresh_metadata();

   //ToDo: Function partly repeated (this is also in TreeController)
  $scope.process_file_background = function(){
    $scope.process_file_response = "Processing..."; 
    $http({method: 'GET',url: "http://"+backendIp+"/api/v1/process",params: {'file_hash': $scope.params['hash']}}).then(function(response){
      $scope.process_file_response = response.data;
      $scope.process_file_response = $scope.process_file_response+". Refreshing metadata...";
      $scope.refresh_metadata();
      $scope.process_file_response ="ok";
    });
  };



}]);
