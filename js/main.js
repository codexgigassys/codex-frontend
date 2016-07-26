angular.module("myApp", ['ui.router','angular-json-tree','ngFileUpload','smart-table', 'ui.select', 'ngSanitize','ang-drag-drop','angular-clipboard','angular-charthelper']);
if(typeof backend_ip === 'undefined' || typeof backend_port === 'undefined'){
  angular.module("myApp").value('backendIp', '127.0.0.1:4500');//default. Edit ip.js for custom backend ip:port
}else{
  angular.module("myApp").value('backendIp', backend_ip+':'+backend_port);
}


//This service handles the visibility of the big search panel and the two json compare panels, + the diff panel. (From now on, the search_stuff)
angular.module("myApp").service('show_search', function(){
  var show_search = true;
  return {
    getShowSearch: function(){
      return show_search;
    },
    setShowSearch: function(param){
      show_search = param;
    }
  };
});


angular.module("myApp").directive('d3piechart',['$location','charthelper',function($location,charthelper){
	var link = function($scope,$el,$attrs){
		$scope.$watch($scope.hashes,function(){
			updateSvg3();
        }); 
        $scope.$on('dataLoaded3', updateSvg3);
        function updateSvg3(){
			var width = $('#d3charts').width(),
			height = 417,
			radius = Math.min(width, height) / 2;

			var color = d3.scale.ordinal()
				.range(["#86BC25", "#6FC2B4", "#041E42", "#53565A", "#e30613", "#f39200", "#ffd500"]);

			var arc = d3.svg.arc()
				.outerRadius(radius - 10)
				.innerRadius(0);

			var labelArc = d3.svg.arc()
				.outerRadius(radius - 40)
				.innerRadius(radius - 40);

			var pie = d3.layout.pie()
				.sort(null)
				.value(function(d) { return d.frequency; });

			var remove_str="#"+$attrs["id"];
			d3.select(remove_str).selectAll("*").remove();
			var svg = d3.select($el[0]).append("svg")
				.attr("width", width)
				.attr("height", height)
				.append("g")
				.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
			data=charthelper.data_to_percentage($scope.hashes,$attrs["class"].trim());
/*
			data=[
{"age": "<5", "population": 2704659},
 {"age": "<5-13",  "population": 4499890},
 {"age": "<14-17",  "population": 2159981},
 {"age": "<18-24",  "population": 3853788},
 {"age": "<25-44",  "population": 14106543},
 {"age": "<45-64",  "population": 8819342},
 {"age": "≥65",  "population": 612463}] */

				var g = svg.selectAll(".arc")
					.data(pie(data))
					.enter().append("g")
					.attr("class", "arc");

				g.append("path")
					.attr("d", arc)
					.style("fill", function(d) { return color(d.data.letter); });

				g.append("text")
					.attr("transform", function(d) { return "translate(" + labelArc.centroid(d) + ")"; })
					.attr("dy", ".35em")
					.text(function(d) { return d.data.letter; });
			

			function type(d) {
				d.population = +d.population;
				return d;
			}
		}
	};
	return {
		template: '<div class=""></div>',
		replace: true,
		link: link, 
		restrict: 'E' 
	};
}]);

angular.module("myApp").directive('d3barchart',['$location','charthelper','$window',function($location,charthelper,$window){
	var link = function($scope,$el,$attrs){
        

		$scope.$watch($scope.hashes,function(){
			updateSvg2();
		}); 


        
		function updateSvg2() {
			var margin = {top: 20, right: 20, bottom: 30, left: 40},
            width = $('#d3charts').width() - margin.left - margin.right;
			//width = parseInt($window.innerWidth*0.3) - margin.left - margin.right,
			height = 300 - margin.top - margin.bottom;

			var x = d3.scale.ordinal()
				.rangeRoundBands([0, width], .1);

			var y = d3.scale.linear()
				.range([height, 0]);

			var xAxis = d3.svg.axis()
				.scale(x)
				.orient("bottom");

			var yAxis = d3.svg.axis()
				.scale(y)
				.orient("left");
			var remove_str="#"+$attrs["id"];
            //d3.select("svg").remove();
			d3.select(remove_str).selectAll("*").remove();

			var svg = d3.select($el[0]).append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
				.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
			/*
            var data=[
            {"letter": "A",	"frequency": 0.08167},
            {"letter": "B",	"frequency": 0.01492},
            {"letter": "C",	"frequency": 0.02782},
            {"letter": "D",	"frequency": 0.04253}
            ];*/
            
            if($scope.hashes.length > 0 ){
            
			var data=charthelper.data_to_percentage($scope.hashes,$attrs["class"].trim());
            
			x.domain(data.map(function(d) { return d.letter; }));
			y.domain([0, d3.max(data, function(d) { return d.frequency; })]);

			svg.append("g")
				.attr("class", "x axis")
				.attr("transform", "translate(0," + height + ")")
				.call(xAxis);

            
			svg.append("g")
				.attr("class", "y axis")
				.call(yAxis)
				.append("text")
				.attr("transform", "rotate(-90)")
				.attr("y", 6)
				.attr("dy", ".71em")
				.style("text-anchor", "end")
				.text("Count");
            

			svg.selectAll(".bar")
				.data(data)
				.enter().append("rect")
				.attr("class", "bar")
				.attr("x", function(d) { return x(d.letter); })
				.attr("width", x.rangeBand())
				.attr("y", function(d) { return y(d.frequency); })
				.attr("height", function(d) { return height - y(d.frequency); });
            }
        }
        $scope.$on('dataLoaded2', updateSvg2);
        
		function type(d) {
			d.frequency = +d.frequency;
			return d;
		} 
        
    };
    return {
        template: '<div class=""></div>',
        replace: true,
        link: link, 
        restrict: 'E' 
    };

}]);

angular.module("myApp").directive('d3bubblechart',['$location',function($location){  
  var link = function($scope,$el,$attrs){
    $scope.$watch($scope.json, function() {
      updateSvg();
    });
    function resize() {
      d3.select("svg").attr("width", $el[0].clientWidth);
      d3.select("svg").attr("height", $el[0].clientWidth); //It's a square
    }
    /**
     * Randomize array element order in-place.
     * Using Durstenfeld shuffle algorithm.
     * http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
     */
    function shuffleArray(array) {
      for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
      }
      return array;
    }
    //D3 code
	function updateSvg(){
	  color_rgb={"green": "#2ecc71","black": "#000000", "blue":"#2980b9", "yellow":"#f1c40f", "orange": "#d35400", "red": "#e74c3c" };
	  new_array=[];
	  $scope.colors_counter={"green": 0, "black": 0, "blue": 0, "yellow": 0, "orange": 0, "red": 0 };
	  for(var i in $scope.json.object){
		cetera_value=$scope.json.object[i]["value"];
		new_object={"name": $scope.json.object[i]["av_result"],
		  "size": cetera_value*10,
		  "hash": $scope.json.object[i]["hash"],
		  "date": $scope.json.object[i]["date"]
		}
        if(new_object["name"] == "None"){
          new_object["color"]=color_rgb["green"];
          $scope.colors_counter["green"]+=1;
        } else if(cetera_value < 0.25){
          new_object["color"]=color_rgb["black"];
          $scope.colors_counter["black"]+=1;
        } else if(cetera_value >= 0.25 && cetera_value < 0.5){
          new_object["color"]=color_rgb["blue"]; // flatuicolors.com
          $scope.colors_counter["blue"]+=1;
        } else if(cetera_value >= 0.5 && cetera_value < 0.75){
          new_object["color"]=color_rgb["yellow"];
          $scope.colors_counter["yellow"]+=1;
        } else if(cetera_value >= 0.75 && cetera_value < 0.9){
          new_object["color"]=color_rgb["orange"];
          $scope.colors_counter["orange"]+=1;
        } else if(cetera_value >= 0.9 && cetera_value <= 1){
          new_object["color"]=color_rgb["red"];//red
          $scope.colors_counter["red"]+=1;
        } else {
          new_object["color"]="#7f8c8d";//silver (bug)
        }
        if(typeof new_object["name"] == 'undefined' || new_object["name"] == "None" || new_object["name"].length == 0){
          new_object["name"]=""
        }
        new_array.push(new_object);
      }
      $scope.total_hashes=new_array.length;
      //new_array = shuffleArray(new_array);
      $scope.datos={ "name": "dates", "children": new_array }
      var bleed = 100,
      width = 700,
      height = 700;

      var pack = d3.layout.pack()
        .sort(null)
        .size([width, height + bleed * 2])
        .padding(2);
      d3.select("svg").remove();

      var svg = d3.select($el[0]).append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("background-color", "white")
        .append("g")
        .attr("transform", "translate(0," + (-bleed) + ")");


      var node = svg.selectAll(".node")
        .data(pack.nodes(flatten($scope.datos))
            .filter(function(d) { return !d.children; }))
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

      node.append("circle")
        .attr("r", function(d) { return d.r; })
        .style("fill", function(d) { return (d.color); })
        .on("click",function(d) { $location.path('/metadata/'+d.hash); $scope.$apply(); })
        .on("mouseover",function(d) { d3.select(this).style("fill","black"); })
        .on("mouseout",function(d) { d3.select(this).style("fill",function(d) { return d.color;}); });

      node.append("text")
        .text(function(d) { return d.name; })
        .style("font-size", function(d) { return Math.min(2 * d.r, (2 * d.r ) / this.getComputedTextLength() * 24) + "px"; })
        .attr("dy", ".35em");

	  //Annotations
      var startx=595;
      var starty=695;
      var i=0;
      svg.append("text")
        .text(function(){ return "% similarity";})
        .style("font-size", "11px" )
        .style("fill", "black" )
        .attr("dy", "0.05em")
		.attr("class","antext")
		.attr("transform",function(){ return "translate("+(startx+50)+","+(starty+i*15-5)+")"});
	  svg.append("line")
		.attr("x1", 0)
		.attr("y1", 0)
		.attr("x2", 90)
		.attr("y2", 0)
		.attr("stroke-width", 1)
		.attr("stroke", "black")
		.attr("transform",function(){ return "translate("+startx+","+(starty+i*15-3)+")"});
	  svg.append("rect")
		.attr("width", 10)
		.attr("height", 10)
		.style("fill",color_rgb["red"])
		.attr("transform",function(){ return "translate("+startx+","+starty+")"});
      svg.append("text")
        .text(function(){ return "90% - 100%";})
        .style("font-size", "11px" )
        .style("fill", "black" )
        .attr("dy", "0.05em")
		.attr("class","antext")
		.attr("transform",function(){ return "translate("+(startx+45+4)+","+(starty+8+i*15)+")"});
      svg.append("text") // red counter
        .text(function(){ return "("+$scope.colors_counter["red"]+")";})
        .style("font-size", "11px" )
        .style("fill", "black" )
        .attr("dy", "0.05em")
		.attr("class","antext")
		.attr("transform",function(){ return "translate("+(startx+90)+","+(starty+8+i*15)+")"});
      i+=1;
	  svg.append("rect")
		.attr("width", 10)
		.attr("height", 10)
		.style("fill",color_rgb["orange"])
		.attr("transform",function(){ return "translate("+startx+","+(starty+i*15)+")"});
      svg.append("text")
        .text(function(){ return "75% - 90%";})
        .style("font-size", "11px" )
        .style("fill", "black" )
        .attr("dy", "0.05em")
		.attr("class","antext")
		.attr("transform",function(){ return "translate("+(startx+45)+","+(starty+8+i*15)+")"});
      svg.append("text")
        .text(function(){ return "("+$scope.colors_counter["orange"]+")";})
        .style("font-size", "11px" )
        .style("fill", "black" )
        .attr("dy", "0.05em")
		.attr("class","antext")
		.attr("transform",function(){ return "translate("+(startx+90)+","+(starty+8+i*15)+")"});
      i+=1;
	  svg.append("rect")
		.attr("width", 10)
		.attr("height", 10)
		.style("fill",color_rgb["yellow"])
		.attr("transform",function(){ return "translate("+startx+","+(starty+i*15)+")"});
      svg.append("text")
        .text(function(){ return "50% - 75%";})
        .style("font-size", "11px" )
        .style("fill", "black" )
        .attr("dy", "0.05em")
		.attr("class","antext")
		.attr("transform",function(){ return "translate("+(startx+45)+","+(starty+8+i*15)+")"});
      svg.append("text")
        .text(function(){ return "("+$scope.colors_counter["yellow"]+")";})
        .style("font-size", "11px" )
        .style("fill", "black" )
        .attr("dy", "0.05em")
		.attr("class","antext")
		.attr("transform",function(){ return "translate("+(startx+90)+","+(starty+8+i*15)+")"});
      i+=1;
	  svg.append("rect")
		.attr("width", 10)
		.attr("height", 10)
		.style("fill",color_rgb["blue"])
		.attr("transform",function(){ return "translate("+startx+","+(starty+i*15)+")"});
      svg.append("text")
        .text(function(){ return "25% - 50%";})
        .style("font-size", "11px" )
        .style("fill", "black" )
        .attr("dy", "0.05em")
		.attr("class","antext")
		.attr("transform",function(){ return "translate("+(startx+45)+","+(starty+8+i*15)+")"});
      svg.append("text")
        .text(function(){ return "("+$scope.colors_counter["blue"]+")";})
        .style("font-size", "11px" )
        .style("fill", "black" )
        .attr("dy", "0.05em")
		.attr("class","antext")
		.attr("transform",function(){ return "translate("+(startx+90)+","+(starty+8+i*15)+")"});
      i+=1;
	  svg.append("rect")
		.attr("width", 10)
		.attr("height", 10)
		.style("fill",color_rgb["green"])
		.attr("transform",function(){ return "translate("+startx+","+(starty+i*15)+")"});
      svg.append("text")
        .text(function(){ return "Clean file";})
        .style("font-size", "11px" )
        .style("fill", "black" )
        .attr("dy", "0.05em")
		.attr("class","antext")
		.attr("transform",function(){ return "translate("+(startx+45-5)+","+(starty+8+i*15)+")"});
      svg.append("text")
        .text(function(){ return "("+$scope.colors_counter["green"]+")";})
        .style("font-size", "11px" )
        .style("fill", "black" )
        .attr("dy", "0.05em")
		.attr("class","antext")
		.attr("transform",function(){ return "translate("+(startx+90)+","+(starty+8+i*15)+")"});
      i+=1;
	  svg.append("line")
		.attr("x1", 0)
		.attr("y1", 0)
		.attr("x2", 90)
		.attr("y2", 0)
		.attr("stroke-width", 1)
		.attr("stroke", "black")
		.attr("transform",function(){ return "translate("+startx+","+(starty+i*15)+")"});
      svg.append("text")
        .text(function(){ return "Total: "+new_array.length;})
        .style("font-size", "11px" )
        .style("fill", "black" )
        .attr("dy", "0.05em")
		.attr("class","antext")
		.attr("transform",function(){ return "translate("+(startx+50)+","+(starty+8+i*15+3)+")"});

      // Returns a flattened hierarchy containing all leaf nodes under the root.
      function flatten(root) {
        var nodes = [];

        function recurse(node) {
          if (node.children) node.children.forEach(recurse);
          else nodes.push({name: node.name, value: node.size, color: node.color, hash: node.hash});
        }

        recurse(root);
        return {children: nodes};
      }
    }
    $scope.$on('windowResize', resize);
    $scope.$on('dataLoaded', updateSvg);
  };
  return {
    template: '<div class=""></div>',
    replace: true,
    link: link, 
    restrict: 'E' 
  };
}]);


/* This filter recieves a row, which
 * is an Object with description, size, sha1
 * or the parameters that the api replied,
 * and returns an array with the values of these parameters
 * in the same order as hashes_headers.
 * hashes_headers is the result of 
 * sha1_should_be_first funciton. Basically it recieves
 * the list of headers in an array, and returns the same array,
 * but with sha1 as the first element.
 * All this madness is just to have sha1 always as the first
 * column.
 */
angular.module("myApp").filter('sha1first',function(){
  return function(row,hashes_headers){
    var i;
    var array=[];

    for(i=0; i < hashes_headers.length; i++){
      array.push(row[hashes_headers[i]]); 
    }
    return array;
  };
});

