angular.module("myApp").controller("DownloadController",['$scope','$http','backendIp','show_search',function($scope,$http,backendIp,show_search){
  //Watchers
  $scope.$watch('show_search2',function(newValue,oldValue){
    if(newValue !== oldValue) show_search.setShowSearch(newValue);
  });
  $scope.$watch(function(){return show_search.getShowSearch();},function(newValue,oldValue){
    if(newValue!==oldValue) $scope.show_search2=newValue;
  });
  this.backendIp=backendIp;
  $scope.download_response="";
  $scope.download_file = function(){
    $scope.download_response="Waiting for server..."
      $.fileDownload('http://'+backendIp+'/api/v1/download', {
          httpMethod : "POST",
          data : {"file_hash" : $scope.sha1},
          successCallback: function(url){
            console.log("successCallback");//Bug: can't make success callback work -_-
          }
          });
  };
}]);
