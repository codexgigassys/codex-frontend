angular.module("myApp").controller("ProcessController",['$scope','$http','backendIp','show_search','$location','$interval',function($scope,$http,backendIp,show_search,$location,$interval){
  //Watchers
  $scope.$watch('show_search2',function(newValue,oldValue){
    if(newValue !== oldValue) show_search.setShowSearch(newValue);
  });
  $scope.$watch(function(){return show_search.getShowSearch();},function(newValue,oldValue){
    if(newValue!==oldValue) $scope.show_search2=newValue;
  });
  this.backendIp=backendIp;
  $scope.process = true;
  $scope.process_response="";
  $scope.processed=[];
  $scope.task_errors=[];
  $scope.not_found=[];
  $scope.downloaded=[];
  $scope.task_id = "";
  $scope.document_name = "";
  $scope.document_name_r = ""; // Received via ajax
  $scope.date_start = "";
  $scope.date_end = "";
  $scope.date_enqueued = "";
  $scope.has_finished = false;
  $scope.got_result = false;

  $scope.get_task_report = function(first_time = false){
      if($scope.params['task_id'] == ""){
          return;
      }
      $http({method: 'GET',url: "http://"+backendIp+"/api/v1/task?task_id="+$scope.params['task_id'] }).then(function(response){
        try{
          process_task_data(response.data);
          if(first_time){
              // To fill form with the requested data.
              $scope.sha1 = response.data['requested']['file_hash'];
              $scope.vt_av = response.data['requested']['vt_av'];
              $scope.vt_samples = response.data['requested']['vt_samples'];
              $scope.process = response.data['requested']['process'];
              $scope.email = response.data['requested']['email'];
              $scope.document_name = response.data['requested']['document_name'];
          }
        }
        catch(ex){
          console.log(ex);
        }
      });
  };

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


  $scope.process_file = function(){
    $scope.process_response="Processing hashes..."
      $http({method: 'POST',url: "http://"+backendIp+"/api/v1/task",data: $.param({'file_hash': $scope.sha1,'process': $scope.process,'vt_av': $scope.vt_av, 'vt_samples': $scope.vt_samples, 'email': $scope.email, 'document_name': $scope.document_name })}).then(function(response){
        $scope.hashes_logs = [];
        try{
          $scope.process_response = response.data;
          process_task_data(response.data);
          $location.path('/process/'+$scope.task_id)
        }
        catch(ex){
          console.log(ex);
        }
      });

  };

  process_task_data = function(task_data){
          $scope.processed = task_data["processed"];
          $scope.task_errors = task_data["errors"];
          $scope.not_found = task_data["not_found"];
          $scope.downloaded = task_data["downloaded"];
          $scope.task_id = task_data["task_id"];
          $scope.document_name_r = task_data["document_name"];
          $scope.date_start = task_data["date_start"];
          $scope.date_end = task_data["date_end"];
          $scope.date_enqueued = task_data["date_enqueued"];
          $scope.hashes = task_data["hashes"];
          $scope.not_found_on_vt = task_data["not_found_on_vt"];
          $scope.not_found_for_processing = task_data["not_found_for_processing"];
          $scope.inconsistencies = task_data["inconsistencies"];
          $scope.errors = task_data["errors"];
          $scope.duplicated_samples = task_data["duplicated_samples"];
          $scope.duplicated_hashes = task_data["duplicated_hashes"];
          $scope.vt_av_added = task_data["vt_av_added"];
          $scope.vt_av_out_of_credits = task_data["vt_av_out_of_credits"];
          $scope.not_found_on_vt_av = task_data["not_found_on_vt_av"];
          $scope.vt_av_already_downloaded = task_data["vt_av_already_downloaded"];
          $scope.private_credits_spent = task_data["private_credits_spent"];
          $scope.public_credits_spent = task_data["public_credits_spent"];
	      $scope.queue_time = calcDiff(task_data["date_enqueued"],task_data["date_start"]);
	      $scope.task_time = calcDiff(task_data["date_start"],task_data["date_end"]);
	      $scope.total_time = calcDiff(task_data["date_enqueued"],task_data["date_end"]);
console.log("queue_time=");
console.log($scope.queue_time);
console.log("task_time=");
console.log($scope.task_time);
console.log("total_time=");
console.log($scope.total_time);

  };

  $scope.check_if_finished = function(has_finished){
      $http({method: 'GET',url: "http://"+backendIp+"/api/v1/task_finished?task_id="+$scope.params['task_id']}).then(function(response){
          $scope.has_finished = response.data['has_finished'];
      });
  };

  if($scope.params["task_id"] !== "" && $scope.params["task_id"] !== undefined ){
      $scope.get_task_report(true);
  }

  $scope.check_if_finished_interval = $interval(function(){
      $scope.inter_func();
  },2000);

  $scope.inter_func = function(){
      if($scope.params['task_id'] !== "" && $scope.params['task_id'] !== undefined && !$scope.got_result){
          finished_return = $scope.check_if_finished($scope.has_finished);
          if($scope.has_finished){
            $scope.get_task_report();
            $scope.got_result = true;
          }
      }


  };


}]);
