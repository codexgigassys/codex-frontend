angular.module("myApp").controller("HomeController",['$scope','$http','backendIp','show_search','clipboard',function($scope,$http,backendIp,show_search,clipboard){
  $scope.show_search2=true;

  //watchers to see if there was a change in the visibility of the search stuff.
  $scope.$watch('show_search2',function(newValue,oldValue){
    if(newValue !== oldValue) show_search.setShowSearch(newValue);
  });
  $scope.$watch(function(){return show_search.getShowSearch();},function(newValue,oldValue){
    if(newValue!==oldValue) $scope.show_search2=newValue;
  });


  $scope.show_search2=true;
}]);
