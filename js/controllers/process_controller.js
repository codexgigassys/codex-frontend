angular.module("myApp").controller("ProcessController",['$scope','$http','backendIp','show_search',function($scope,$http,backendIp,show_search){
  //Watchers
  $scope.$watch('show_search2',function(newValue,oldValue){
    if(newValue !== oldValue) show_search.setShowSearch(newValue);
  });
  $scope.$watch(function(){return show_search.getShowSearch();},function(newValue,oldValue){
    if(newValue!==oldValue) $scope.show_search2=newValue;
  });
  this.backendIp=backendIp;
  $scope.process_response="";
  $scope.process_file = function(){
    $scope.process_response="Processing hashes..."
      $http({method: 'POST',url: "http://"+backendIp+"/api/v1/process",data: $.param({'file_hash': $scope.sha1})}).then(function(response){
        $scope.hashes_logs = [];
        try{
          $scope.process_response = response.data['message'];
        }
        catch(ex){
          console.log(ex);
        }
      });
  };
}]);
