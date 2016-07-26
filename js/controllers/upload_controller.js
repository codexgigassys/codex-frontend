angular.module("myApp").controller("UploadController",['$scope','Upload','$timeout','backendIp',function($scope,Upload,$timeout,backendIp){
  $scope.process=1;
  $scope.uploadFiles = function(file, errFiles) {
    $scope.f = file;
    $scope.errFile = errFiles && errFiles[0];
    if (file) {
      file.upload = Upload.upload({
        url: "http://"+backendIp+"/api/v1/file/add",
        //url: 'https://angular-file-upload-cors-srv.appspot.com/upload',
        data: {file: file}
      });

      file.upload.then(function (response) {
        $timeout(function () {
          file.result = response.data;
          $scope.upload_response = response.data["message"];
        });
      }, function (response) {
        if (response.status > 0)
          $scope.errorMsg = response.status + ': ' + response.data;
      }, function (evt) {
        file.progress = Math.min(100, parseInt(100.0 * 
              evt.loaded / evt.total));
      });
    }   
  }
}]);
