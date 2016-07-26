angular.module("myApp").controller("LogsController",['$scope','$http','backendIp','show_search',function($scope,$http,backendIp,show_search){
  this.backendIp=backendIp;
  $scope.hashes_logs = [{"datetime": "", "message": "loading ..."}];

  //watchers
  $scope.$watch('show_search2',function(newValue,oldValue){
    if(newValue !== oldValue) show_search.setShowSearch(newValue);
  });
  $scope.$watch(function(){return show_search.getShowSearch();},function(newValue,oldValue){
    if(newValue!==oldValue) $scope.show_search2=newValue;
  });

  //Refresh logs
  $scope.refresh_logs = function(){
    $scope.refresh_status = "Refreshing.. ";
    $http({method: 'GET',url: "http://"+backendIp+"/api/v1/logs"}).then(function(response){
      try{
        $scope.hashes_logs = response.data;
        $scope.refresh_status ="";
      }
      catch(ex){
        console.log(ex);
      }
    });
  };
  //Reqeust logs at least one time.
  $scope.refresh_logs();
}]);
