angular.module("myApp").controller("TasksOnQueueController",['$scope','$http','backendIp','show_search',function($scope,$http,backendIp,show_search){
  this.backendIp=backendIp;
  $scope.queues = [{"queue_name": "loading queues..", "tasks": [{"task_id": "loading tasks...", "date_enqueued": "1970-01-01T00:00Z"}]}];

  //watchers
  $scope.$watch('show_search2',function(newValue,oldValue){
    if(newValue !== oldValue) show_search.setShowSearch(newValue);
  });
  $scope.$watch(function(){return show_search.getShowSearch();},function(newValue,oldValue){
    if(newValue!==oldValue) $scope.show_search2=newValue;
  });

  //Refresh logs
  $scope.refresh_tasks_on_queue = function(){
    $scope.refresh_status = "Refreshing.. ";
    $http({method: 'GET',url: "http://"+backendIp+"/api/v1/queue_tasks"}).then(function(response){
      try{
        $scope.queues = response.data["queue_tasks"];
        $scope.current_date = response.data["current_date"];
        $scope.refresh_status ="";
      }
      catch(ex){
        console.log(ex);
      }
    });
  };
  //Reqeust logs at least one time.
  $scope.refresh_tasks_on_queue();
  //ToDo: dup function 
  calcDiff = function(firstDate, secondDate){
	  if(firstDate == undefined || secondDate == undefined){
        return "";
	  }
	  if(typeof(firstDate) == "string"){
		  firstDate = new Date(firstDate);
		  secondDate = new Date(secondDate);
	  }
	  var diffSeconds = Math.round(Math.abs((firstDate - secondDate)/1000));
	  return diffSeconds;
  }

  $scope.get_time_on_queue = function(date){
    console.log("date=");
    console.log(date);
    console.log("currentDate=");
    console.log($scope.current_date);
    return calcDiff(date,$scope.current_date);
  }

}]);
