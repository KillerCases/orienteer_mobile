function ResultCalculation(a){

	var result = 0;
	var confirmed = [{Latitude:1, Longitude:1}];
	
	var correctCheckpoints = [
	{Ref:1, Latitude: 37.785834, Longitude: -122.406417},
	{Ref:2, Latitude: 37.7750, Longitude: 122.4183},
	{Ref:3, Latitude: 37.7750, Longitude: 122.4183},
	{Ref:4, Latitude: 37.7750, Longitude: 122.4183},
	{Ref:5, Latitude: 37.7750, Longitude: 122.4183},
	{Ref:6, Latitude: 37.7750, Longitude: 122.4183},
	{Ref:7, Latitude: 37.7750, Longitude: 122.4183},
	{Ref:8, Latitude: 37.7750, Longitude: 122.4183},
	{Ref:9, Latitude: 37.7750, Longitude: 122.4183},
	{Ref:10, Latitude: 37.7750, Longitude: 122.4183},
	{Ref:11, Latitude: 37.7750, Longitude: 122.4183},
	{Ref:12, Latitude: 37.7750, Longitude: 122.4183},
	{Ref:13, Latitude: 37.7750, Longitude: 122.4183},
	{Ref:14, Latitude: 37.7750, Longitude: 122.4183},
	{Ref:15, Latitude: 37.7750, Longitude: 122.4183},
	{Ref:16, Latitude: 37.7750, Longitude: 122.4183},
	{Ref:17, Latitude: 37.7750, Longitude: 122.4183},
	{Ref:18, Latitude: 37.7750, Longitude: 122.4183},
	{Ref:19, Latitude: 37.7750, Longitude: 122.4183},
	{Ref:20, Latitude: 37.7750, Longitude: 122.4183}
	];

	function dedup(a, c){
		var dup =0
		for(var k=0; k<c.length; k++){
			var latMax = c[k].Latitude + 0.0001;
			var latMin = c[k].Latitude - 0.0001;
			var longMax = c[k].Longitude + 0.0001;
			var longMin = c[k].Longitude - 0.0001;
			if((a.Latitude >=latMin) && (a.Latitude <=latMax)){
				if((a.Longitude >=longMin) && (a.Longitude <=longMax)){
					console.log('dup');
					dup++;
					return dup;
				}	
			}
		}
	};

	function compare(a, b){
		var match =0;
		for(var j=0; j<b.length; j++)
		{
			var latMax = b[j].Latitude + 0.0001;
			var latMin = b[j].Latitude - 0.0001;
			var longMax = b[j].Longitude + 0.0001;
			var longMin = b[j].Longitude - 0.0001;
			if((a.Latitude >= latMin) && (a.Latitude <= latMax))
			{
				if((a.Longitude >=longMin) && (a.Longitude <=longMax)){
					match++;
					return match;
				}
			}
		}
	};

	function check(a, b, c){
		for (var i=0;i<a.length; i++){
			var match = compare(a[i],b);
			var duplicate = dedup(a[i],c);
			if( match && !duplicate){
				confirmed.push({Latitude: a[i].Latitude, Longitude: a[i].Longitude})
				result++;
			}
		}
	};

	check(a, correctCheckpoints, confirmed);
	return result;

};



/*
$('#test').on("click", function(e){
	resultCalculation(userCheckpoints);
});
*/


