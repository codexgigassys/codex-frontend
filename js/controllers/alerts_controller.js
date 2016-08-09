angular.module("myApp").controller("AlertsController",['$scope','$http','backendIp','show_search',function($scope,$http,backendIp,show_search){
  //Watchers
  $scope.$watch('show_search2',function(newValue,oldValue){
    if(newValue !== oldValue) show_search.setShowSearch(newValue);
  });
  $scope.$watch(function(){return show_search.getShowSearch();},function(newValue,oldValue){
    if(newValue!==oldValue) $scope.show_search2=newValue;
  });
  this.backendIp=backendIp;
  $scope.alerts_response="";
  $scope.alerts_file = function(){
    $scope.process_response="Creating alerts..."
      $http({method: 'POST',url: "http://"+backendIp+"/api/v1/alerts/new",data: $.param({'file_hash': $scope.sha1, 'email': $scope.email, 'description': $scope.description})}).then(function(response){
        $scope.hashes_logs = [];
        try{
          $scope.alerts_response = response.data;
        }
        catch(ex){
          console.log(ex);
        }
      });
  };
}]);
