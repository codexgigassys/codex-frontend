angular.module("myApp").controller("HashController",['$scope','$http','$stateParams','backendIp','$location',function($scope,$http,$stateParams,backendIp,$location){
  if($location.path() != null && $location.path().substring(0,9) == "/metadata"){
    $scope.hash_on_display = $location.path().substring(10,$location.path().length);
  }
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

  // ToDo: Function repeated
  $scope.scan_file_background = function(){
    hash=$scope.hash_on_display;
    $scope.process_file_response = "Retrieving scan results from virtustotal.com ...";
    $http({method: 'GET',url: "http://"+backendIp+"/api/v1/av_result",params: {'file_hash': hash}}).then(function(response){
      if(response.data["error"] != null){
          console.log("error in proces_file_background");
          console.log(response.data["error"]);
          $scope.process_file_response="Error "+response.data["error"]+". "+response.data["error_message"];
      }else{
      $scope.process_file_response = response.data["message"]+". Refreshing metadata...";
      $scope.refresh_metadata(hash);
      $scope.process_file_response ="ok";
      }
    });
  };


}]);
