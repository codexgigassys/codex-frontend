(function (root, factory) {
    /* istanbul ignore next */
    if (typeof define === 'function' && define.amd) {
        define(['angular'], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory(require('angular'));
    } else {
        root.angularCharthelper = factory(root.angular);
  }
}(this, function (angular) {

return angular.module('angular-charthelper', [])
    .factory('charthelper', ['$document', function ($document) {
        // YYYY-MM-DD HH:MM:SS --> YYYY-MM-DD
        function remove_hour_seconds_from_datetime(date){
            if(date !== null && date !== undefined){
                return date.substring(0,10);
            }else{
                return null;
            }
        }


		function parse (str) {
			// validate year as 4 digits, month as 01-12, and day as 01-31 
			if ((str = str.match (/^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/))) {
				// make a date
				str[0] = new Date (+str[1], +str[2] - 1, +str[3]);
				// check if month stayed the same (ie that day number is valid)
				if (str[0].getMonth () === +str[2] - 1)
					return str[0];
			}
			return undefined;
		}

        function data_to_percentage(data,mongo_key) {
			counter={}
            total=0
			for (var i = 0; i < data.length ; i++) {
                if(mongo_key === "TimeDateStamp"){
		            tmp_key=remove_hour_seconds_from_datetime(data[i][mongo_key]);
                }else
                {
		            tmp_key=data[i][mongo_key];
                }
				if(counter[tmp_key]===undefined){
					counter[tmp_key]=0;
				}
				counter[tmp_key]+=1;
                total+=1;
			}
            results=[];
            keys_array = Object.keys(counter);
            if(mongo_key === "TimeDateStamp"){
                keys_array = keys_array.sort(function(a,b){
                    return parse(a) - parse(b);
                });
            }
            for (i=0;i < keys_array.length; i++){
               tmp_key=keys_array[i];
               results.push({"letter": tmp_key, "frequency": counter[tmp_key]});
            }
			return results;
        }

        return {
            data_to_percentage: data_to_percentage
        };
    }])


}));
