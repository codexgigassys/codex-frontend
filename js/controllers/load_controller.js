angular.module("myApp").controller("LoadController",['$scope','$http','backendIp','show_search','$interval',function($scope,$http,backendIp,show_search,$interval){
  this.backendIp=backendIp;

  //watchers
  $scope.$watch('show_search2',function(newValue,oldValue){
    if(newValue !== oldValue) show_search.setShowSearch(newValue);
  });
  $scope.$watch(function(){return show_search.getShowSearch();},function(newValue,oldValue){
    if(newValue!==oldValue) $scope.show_search2=newValue;
  });

  $scope.load_response="";

  //return number of files
  $scope.number_of_files = function(){
    $scope.refresh_status = "Refreshing.. ";
    $http({method: 'GET',url: "http://"+backendIp+"/api/v1/status_files_to_load"}).then(function(response){
      try{
        $scope.number_of_files_to_load = response.data;
      }
      catch(ex){
        console.log(ex);
      }
    });
  };
  //Reqeust logs at least one time.
  $scope.number_of_files();
  

  $scope.load_files = function(){
      $scope.load_response = "Loading and processing files. This could take a while..";
      $http({method: 'GET',url: "http://"+backendIp+"/api/v1/load_to_mongo"}).then(function(response){
          try{
              $scope.load_response = response.data;
          }
          catch(ex){
              console.log(ex);
          }
      });
  };

  $interval(function(){
        $scope.number_of_files();
  },5000);


}]);
