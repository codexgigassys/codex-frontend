angular.module("myApp").controller("TreeController", ['$scope','$http','$interval','backendIp','show_search','clipboard','$location','$anchorScroll','charthelper','$window', function($scope,$http,$interval,backendIp,show_search,clipboard,$location,$anchorScroll,charthelper,$window) {
    /*
	$scope.$watch($scope.hashes,function(){
		$scope.$broadcast('dataLoaded2');
		console.log("brodcasted");
	//	updateSvg2();
	}); */
    /*
        $scope.$watch($window,function(){
            console.log("window resized");
            console.log($window.innerWidth);
        //    updateSvg2();
        });
        */

    // Function to replace . with -, because of this
    // http://stackoverflow.com/a/79022
    $scope.replace_dot_with_hyphen = function(str){
            return str.toString().replace('.','-');
    };

    $scope.clear_yara_response = function(){
        $scope.yara_response="";
    };

    $scope.lowercase = function(lower_boolean, item_id){
        if(lower_boolean !== true){
            return;
        }
        value = $("#input-"+item_id).val();
        $("#input-"+item_id).val(value.toLowerCase());

    };

	valid_hash = function(str){
		return ((str.match('[a-fA-F0-9]{40}') !== null && str.length === 40) ||
				(str.match('[a-fA-F0-9]{32}') !== null && str.length === 32) ||
				(str.match('[a-fA-F0-9]{64}') !== null && str.length === 64))
	};

	$scope.validate_hash = function(str,form_id){
		if(! valid_hash(str.trim())){
			$('#formgroup-'+form_id).addClass("has-error");
			$('#input-'+form_id).css("background-color","#fef5f1");
		}else{
			$('#formgroup-'+form_id).removeClass("has-error");
			$('#input-'+form_id).css("background-color","white");
		}
	};

    $scope.call_func = function(api_func,str,form_id){
        if(api_func == 'check_lib' || api_func == 'check_imp'){
            $scope.check_libimp(api_func,str,form_id);
        }else if(api_func == 'validate_hash'){
            $scope.validate_hash(str,form_id);
        }

    };

    $scope.check_libimp = function(api_func,str,form_id){
        form_id=$scope.replace_dot_with_hyphen(form_id);
        if(api_func === undefined || api_func === null || api_func === "" ){
            return;
        }
        if(str === ""){
            $('#formgroup-'+form_id).removeClass("has-error");
            return;
        }
        $http({method: 'GET',url: "http://"+backendIp+"/api/v1/"+api_func, params: {'q': str}}).then(function(response){

            $scope.hashes_logs = [];
            try{
                tmp_valid = response.data["valid"];
                if(tmp_valid==false){
                    console.log("tmp_valid=");
                    console.log(tmp_valid);
                    $('#formgroup-'+form_id).addClass("has-error");
                    $('#input-'+form_id).css("background-color","#fef5f1");
                }else{
                    $('#formgroup-'+form_id).removeClass("has-error");
                    $('#input-'+form_id).css("background-color","white");
                }
            }
            catch(ex){
                console.log(ex);
            }

        });
    };

    $scope.expand_search_div = function(){
        $('#search-div-col').attr("class","col-md-12");
        $('#expand_search_div_arrow').css("display","none");
        $('#collapse_search_div_arrow').css("display","inline");
    };
    $scope.collapse_search_div = function(){
        $('#search-div-col').attr("class","col-md-8");
        $('#expand_search_div_arrow').css("display","inline");
        $('#collapse_search_div_arrow').css("display","none");
    };

   $scope.expand_charts_div = function(){
		$('#right-side-blocks').attr("class","col-md-12");
        $('#search-div-col').hide();
		$('#expand_charts_div_arrow').hide();
		$('#collapse_charts_div_arrow').show();
		  $scope.$broadcast('dataLoaded2');
		  $scope.$broadcast('dataLoaded3');
   };

   $scope.collapse_charts_div = function(){
		$('#right-side-blocks').attr("class","col-md-4");
        $('#search-div-col').show();
		$('#expand_charts_div_arrow').show();
		$('#collapse_charts_div_arrow').hide();
		  $scope.$broadcast('dataLoaded2');
		  $scope.$broadcast('dataLoaded3');
   };

  $scope.table_colspan = function(collection){
    var colspan = 2;
    if(collection!==null && collection!=undefined){
      if(collection[0]!==null && collection[0]!=undefined){
        colspan = Object.keys(collection[0]).length;
      }else{
        colspan=1;
      }
    }
    if(colspan-1 >= 1){
      return colspan-1;
    }else{
      return 1;
    }
  };

  //Function that redirects to malware similarities
  $scope.go_to_malware_similarities = function(hash){
      $location.path('/malwarecheckup/'+hash);
  };

  //The function that hides the search stuff.
  $scope.hide_search_stuff = function(){
    $scope.show_search2=false;
  };
  $scope.show_search_stuff = function(){
    $scope.show_search2=true;
  };
  $scope.check_all_entries = function(results,checkbox_status){
    for(var k=0; k < results.length; k++){
      $scope.checkModel[results[k]["sha1"]]=checkbox_status;
    }
    $scope.print_checkmodel();
  };

  $scope.query_selected_hashes = function(query,hashes=""){
      if(hashes==""){
          hashes = get_hashes($scope.checkModel);
      }else{
          hashes=[hashes];

      }
    if(hashes.length==0){
      $scope.button_response="No hashes selected";
      return;
    }
    $.fileDownload('http://'+backendIp+'/api/v1/'+query, {
        httpMethod : "POST",
        data : {"file_hash" : hashes},
        successCallback: function(url){
          console.log("successCallback");//Bug: can't make success callback work -_-
        }
        });
    $scope.button_response  = "Downloading..";
  };

  $scope.copy_selected_hashes = function(){
    hashes = get_hashes($scope.checkModel);
    if(hashes.length==0){
      $scope.button_response="No hashes selected";
      return;
    }
    hashes_string = "";
    for(var k=0; k < hashes.length ; k++){
      hashes_string=hashes_string+hashes[k]+"\n";
    };
    clipboard.copyText(hashes_string);
    $scope.button_response="hashes copied to clipboard";
  };

  change_array_into_string = function(hashes){
    str = "";
    for(var k=0; k < hashes.length;k++){
      if(k==(hashes.length-1)){
        str=str+hashes[k];
      }else{
        str=str+hashes[k]+"\n";
      }
    }
    return str;
  };

  $scope.ioc_selected_hashes = function(){
    hashes = get_hashes($scope.checkModel);
    if(hashes.length==0){
      $scope.button_response="No hashes selected";
      return;
    }
    console.log("not implemented yet");
  };

  $scope.yara_selected_hashes = function(){
    $scope.yara_response="";
    hashes = get_hashes($scope.checkModel);
    if(hashes.length==0){
      $scope.button_response="No hashes selected";
      return;
    }
    //        hashes = change_array_into_string(hashes);//We want this request to be identical to the process menu request.
    $scope.button_response = "Generating Yara Rule... (this could take a while)"
      $http({method: 'POST',url: "http://"+backendIp+"/api/v1/yara",data: $.param({'file_hash': hashes})}).then(function(response){

        $scope.hashes_logs = [];
        try{
          $scope.button_response ="";
          $scope.yara_response = response.data["message"];
        }
        catch(ex){
          console.log(ex);
        }
      });
  };

  $scope.process_selected_hashes = function(){
    hashes = get_hashes($scope.checkModel);
    if(hashes.length==0){
      $scope.button_response="No hashes selected";
      return;
    }
    hashes = change_array_into_string(hashes);//We want this request to be identical to the process menu request.
    $scope.button_response = "Processing....";
    $http({method: 'POST',url: "http://"+backendIp+"/api/v1/process",data: $.param({'file_hash': hashes})}).then(function(response){

      $scope.hashes_logs = [];
      try{
        $scope.button_response = response.data["message"];
      }
      catch(ex){
        console.log(ex);
      }
    });
  };

  get_hashes = function(check){
    hash_array = [];
    for(var k in check){
      if(check[k]){
        hash_array.push(k);   
      }
    }
    return hash_array;
  };

  $scope.print_checkmodel = function(){
    $scope.checked_count=number_checked($scope.checkModel);
  };
  number_checked = function(dic){
    var count=0;
    for(var k in  dic){
      if(dic[k]){
        count++; 
      }
    }
    return count;
  };


  $scope.copy_to_clipboard = function(text){
    clipboard.copyText(text);
  };
  $scope.show_metadata_below_the_results=false;
  $scope.yara_response="";
  $scope.itemsByPage=15;
  $scope.checkModel={
  };

  $scope.go_to_bottom = function(hash){
    $scope.process_file_response="";
    $scope.show_metadata_below_the_results=true;
    $scope.hash_on_display=hash;
    $scope.refresh_metadata(hash);
    //Scroll to the metadata:
    $location.hash('fileh1');
    $anchorScroll();
  };

  //Watchers
  $scope.$watch('show_search2',function(newValue,oldValue){
    if(newValue !== oldValue) show_search.setShowSearch(newValue);
  });
  $scope.$watch(function(){return show_search.getShowSearch();},function(newValue,oldValue){
    if(newValue!==oldValue) $scope.show_search2=newValue;
  });


  $scope.backendIp = backendIp;
  $scope.delete = function(data) {
    data.children = [];
  };
  $scope.add = function(data) { // used to create a tree from json
    var post = data.children.length + 1;
    var newName = data.name + '-' + post;
    data.children.push({name: newName,children: []});
  };
  $scope.get_status="";
  $scope.loading_search_gif=false;
  $scope.block_title=["Block 1","Block 2"];

  /* The list of attributes than can be selected to see in the search resuts
   * table */
  $scope.tree_to_selected = function(node, accum) {
    var i;
    accum = accum || [];
    for (i = 0; i < node.children.length; i++) {
      if(node.children[i].id > 0 && node.children[i].projectable === true){
        accum.push({"id": node.children[i].id, "name": node.children[i].name});
      }
      $scope.tree_to_selected(node.children[i], accum);
    }
    return accum;
  }

  /* When submit the search query, we need the id's of the 
   * column that will be projected in the search results table */
  $scope.get_ids_from_selected = function(hash){
    var i;
    var accum = [];
    if(hash === undefined){
      return accum;
    }
    for (i=0; i < hash.length; i++){
      accum.push(hash[i].id);
    }
    return accum;
  }



  $http.get("http://"+backendIp+"/api/v1/search_tree").then(function(response){
    $scope.tree = response.data;

    for (i = 0; i < $scope.tree.length; i++){
      $scope.itemArray = $scope.tree_to_selected($scope.tree[i],$scope.itemArray);
    }
  });



  $scope.count_status="(loading...)";
  $scope.count="";
  $scope.count_tasks="";
  $scope.av_count="";
  $scope.av_count_status="..."
  $http.get("http://"+backendIp+"/api/v1/queue_count").then(function(response){
    var tmp_response = response.data;
    $scope.count_tasks = tmp_response["count"];
  });
  $interval(function(){$http.get("http://"+backendIp+"/api/v1/queue_count").then(function(response){
    var tmp_response = response.data;
    $scope.count_tasks = tmp_response["count"];
  })},50000);
  $http.get("http://"+backendIp+"/api/v1/samples").then(function(response){
    var tmp_response = response.data;
    $scope.count = tmp_response["count"];
    $scope.count_status = "";
  });
  $http.get("http://"+backendIp+"/api/v1/av_count").then(function(response){
    var tmp_response = response.data;
    $scope.av_count = tmp_response["count"];
    $scope.av_count_status = "";
  });
  $interval(function(){$http.get("http://"+backendIp+"/api/v1/samples").then(function(response){
    var tmp_response = response.data;
    $scope.count = tmp_response["count"];
    $scope.count_status = "";
  })},50000);
  $scope.items = [];
  $scope.hashes = [];

  $scope.remove = function(item){ //form input remove function
    var index = $scope.items.indexOf(item);
    $scope.items[index].disabled=true;
    $scope.formData[$scope.items[index].id]=null;
    $scope.items.splice(index,1);
  };
  var sha1_should_be_first = function(headers){
    if(headers === undefined || headers === null || headers.length === 0){
      return headers;
    }
    if(headers[0]==='sha1'){
      return headers;
    }
    if(headers.indexOf('sha1') == -1 ){
      return headers;
    }
    var copy = headers.slice(); 
    var index = headers.indexOf('sha1');
    if(index > -1 ){
      copy.splice(index,1);
      copy.unshift('sha1');
    }
    return copy;
  };

  //Search submit
  $scope.formData={};
  $scope.formLimit={};
  $scope.formLimit[0]=1;
  $scope.submit_search = function(){
    $scope.checkModel = {};
    $scope.show_metadata_below_the_results=false;
    $scope.yara_response="";
    $scope.button_response="";
    // Trigger validation flag.
    $scope.submitted = true;
    // If form is invalid, return and let AngularJS show validation errors.
    if (search_form.$invalid) {
      return;
    }
    // Default values for the request.
    var config = {
      method : 'POST',
      params : {
        'callback' : 'JSON_CALLBACK',
        'data': $.param($scope.formData),
        'selected[]': $scope.get_ids_from_selected($scope.itemArray.selected),
        'limit': $scope.formLimit[0]
      }
    };

    // Perform JSONP request.
    $scope.get_status="Waiting for server...";
    $scope.loading_search_gif=true;
    var $promise = $http.jsonp(search_form.target, config)
      .success(function(data, status, headers, config) {
        json_status = data[0]["status"];
        if (status == 200 && json_status=="OK") {
		  if(data[0]["data"] !== null){
          response = data[0]["data"]["normal"];
          $scope.hashes = [];
          $scope.hashes.push.apply($scope.hashes,response);
          $scope.hashes_header = [];
          if($scope.hashes.length > 0){
              /*
            for(var keyName in $scope.hashes[0]){        
              $scope.hashes_header.push.apply($scope.hashes_header,[keyName]);
            }
            */
            $scope.hashes_header = data[0]["data"]["show"];
            $scope.hashes_header=sha1_should_be_first($scope.hashes_header);
          }
          $scope.search_results={fieldsName: $scope.hashes_header,records: $scope.hashes};
          $scope.get_status = "Results: "+$scope.hashes.length;
		  $scope.$broadcast('dataLoaded2');
		  $scope.$broadcast('dataLoaded3');
        }else {console.log("data-normal is null")} }
else {
          $scope.get_status = "Server replied with status: "+json_status;

          console.log("jsonp reply valid but not success");
          console.log(data);
          console.log(status);
          console.log(headers);
        }
      })
    .error(function(data, status, headers, config) {
      $scope.get_status="Server error (could be time out, Connection refused, HTTP status 40x, 5xx";
      console.log("jsonp reply invalid");
      console.log(data);
    })
    .finally(function(data) {
      $scope.loading_search_gif=false;
    });
  };
 
  $scope.add_the_same_item_recur = function(node,accum,item_id){
      var i;
      accum = accum || [];
      if($.isArray(node)){
          for (i =  0; i < node.length; i++){
              $scope.add_the_same_item_recur(node[i],accum,item_id);
          }
      }
      else if(node.children !== undefined){
          for (i = 0; i < node.children.length; i++) {
              if(node.children[i].id == item_id){
                  accum.push( node.children[i]);
              }else{
                  $scope.add_the_same_item_recur(node.children[i], accum,item_id);
              }
          }
      }else{
          if(node.id == item_id){
              accum.push( node.children[i]);
          }

      }

      return accum;
  };

  // Function of the plus button at the right of an input text
  // where multiple input text can be used. 
  // Example: when searching for functions, libraries, hidden 
  // functions or hidden libraries.
  $scope.add_the_same_item = function(item_id){
       item_id = Math.trunc(parseFloat(item_id));
       accum = $scope.add_the_same_item_recur($scope.tree,[],item_id);
       if (accum.length > 0){
           $scope.new_search_click(accum[0]);
       }else{
           console.log("strage error in add_the_same_item().");
           console.log("item_id=");
           console.log(item_id);
           console.log("accum");
           console.log(accum);
       }
  };


  //Add new input to the search form
  $scope.new_search_click = function (data) {
    $scope.show_search2=true; // this is to show the search panel and diff block when changing from upload/process/etc to search.
    $scope.execute_diff(); //Bug/ToDo: when changing tab, and returning back. diff/equals tabs are empty.
    /* Prevent duplicates (or not)
     * The form does not allow dups except when
     * the item has parameter multi equals to true.
     * In that case, items will be added with increasing decimal part of the id.
     * For example, adding multiple times the item 3, input ids will look like this:
     * 3, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11, etc
     * It is important not to treat ids as a float, because 3.1 will be equal to 3.10.
     * ids just the treated as strings.
     */
    matches=false;
    multi=false;
    max_after_dot = 0;
    var after_dot="";
    angular.forEach($scope.items,function(item){
      if(data.id === parseInt(item.id) ){ //returns true if for example 3 = parseInt("3.10") or parseInt("3");
        if(data.multi != true){ 
          matches=true;
        }else{
          multi=true;
          after_dot = item.id.toString().match(/\.[0-9]+/g);//get the decimal part through regex
          if( after_dot != null && after_dot.length > 0){ // if the number is 3.10 and not just 3
            after_dot = after_dot[0]; // .10
            after_dot = parseInt(after_dot.replace('.',''));// 10
            if(after_dot > max_after_dot){
              max_after_dot = after_dot;
            }
          }
        }
      }
    });
    if(multi){
      new_id = data.id.toString()+"."+(max_after_dot+1).toString(); // change 3 to 3.11
    }else{
      new_id = data.id;
    }
    //Add it
    if(!matches){
      $scope.items.push({ 
        name: data.name,
        id: new_id,
        type: data.type,
        example: data.example,
        call_func: data.call_func,
        multi: data.multi,
        lower: data.lower
      });
    }
  };

  $scope.select_input_class = function(data){
    var data2=data;
    if(data2==null)
      return false;
    if(data2.type === "checkbox")
      return "checkbox";
    else
      return "form-control";
  };

  //In order for json-tree to work properly, tree has to be initialized with something inside object.
  $scope.compare_window=[{"object": {"status": "Drag and Drop hash here"}},{"object":{"status": "Drag and Drop hash here"}}];
  $scope.hash_viewer={"object": {"status": "Metadata"}};
  $scope.onDrop = function($event,data,array){
    $scope.load_meta_in_window($event,data);
  };

  $scope.dropSuccessHandler = function($event,index){
  };


  $scope.load_meta_in_window = function(compare_window,hash){
    $scope.block_title[compare_window]=hash;
    $scope.compare_window[compare_window].object = {"status": "loading"};
    $http({method: 'GET',url: "http://"+backendIp+"/api/v1/metadata", params: {'file_hash': hash}}).then(function(response){
      var file_metadata = response.data;

      //      $scope.compare_window = {};
      try{
        $scope.compare_window[compare_window].string = JSON.stringify(file_metadata);
        $scope.compare_window[compare_window].object = JSON.parse($scope.compare_window[compare_window].string);
        //      $scope.json.object = file_metadata;
        $scope.execute_diff();
      }
      catch(ex){
        console.log(ex);
      }
    });
  };

  $scope.execute_diff = function(){
    startCompare($scope.compare_window[0].string,$scope.compare_window[1].string,"diff");
    startCompare($scope.compare_window[0].string,$scope.compare_window[1].string,"equals");
    //Remove empty <li> elements. Then empty <ul>s, then empty <li>s again.
    var i=0;
    for(i=0; i < 3; i++){
      $('.contentbox ul li').filter(function() { return $(this).text() == '';}).remove();
      $('ul').each( function() {
        var elem = $(this).children("li").length;
        if(elem == 0){
          $(this).remove();
        }
      }
      );
    }
  };
  //Glyphicon arrows visibility:
  $scope.collapse_block = function(name1,name2){
    $("#"+name1).css("display","none");
    $("#"+name2).css("display","inline");
  };

  $scope.collapse_diff = function(){
    $("#arrow-icon-non-collapse").css("display","none");
    $("#arrow-icon-non-collapsed").css("display","block");
  };

  $scope.uncollapse_diff = function(){
    $("#arrow-icon-non-collapse").css("display","block");
    $("#arrow-icon-non-collapsed").css("display","none");
  };
  //Code for Hash viewer:

  $scope.process_file_response="";
  $scope.json = {};
  $scope.json.object = {"status": "Waiting for server"};
  $scope.get_download_url = function(hash){
    return "http://"+backendIp+"/api/v1/file/get?file_hash="+hash;
  };
  //Refresh metadata function
  $scope.refresh_metadata = function(hash){
    $http({method: 'GET',url: "http://"+backendIp+"/api/v1/metadata", params: {'file_hash': hash }}).then(function(response){
      var file_metadata = response.data;
      $scope.hash_viewer = {"status": "loading"};
      try{
        $scope.hash_viewer.string = JSON.stringify(file_metadata);
        $scope.hash_viewer.object = JSON.parse($scope.hash_viewer.string);
      }
      catch(ex){
        console.log(ex);
      }
    });
  };

  //Process file function
  $scope.process_file_background = function(){
    hash=$scope.hash_on_display;
    $scope.process_file_response = "Processing..."; 
    $http({method: 'GET',url: "http://"+backendIp+"/api/v1/process",params: {'file_hash': hash}}).then(function(response){
      $scope.process_file_response = response.data;
	  $scope.process_file_response = $scope.process_file_response+". Refreshing metadata...";
	  $scope.refresh_metadata(hash);
	  $scope.process_file_response ="ok";
	});
  };
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
