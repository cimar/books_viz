//instead of setting the y and the x as dependent on the data, set the y as always being in one spot.
// so whenever it grows you programmatically determine the height of the data
/*
	Divergent Bar
*/



var d1 = "bar.tsv", d2 = "bar2.tsv"

var margin = {top: 20, right: 30, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var y = d3.scaleBand().rangeRound([0, height]).padding(0.1),
    x = d3.scaleLinear().rangeRound([width, 0]);

var chart = d3.select(".chart")
    .attr("height", height + margin.left + margin.right)
    .attr("width", width + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Define the div for the tooltip
var div = d3.select("body").append("div") 
    .attr("class", "tooltip")       
    .style("opacity", 0);



function extent_mult(arr_dat){
	tar_arr = [];
	cols = arr_dat["columns"];
	console.log(arr_dat["columns"]);
	for (i=1; i<cols.length; i=i+1){
		col = cols[i];
		local_min = d3.min(arr_dat,function(d){ return d[col]; });
		local_max = d3.max(arr_dat,function(d){ return d[col]; });
		console.log(col+local_min);
		console.log(col+local_max);
		tar_arr.push(local_min);
		tar_arr.push(local_max);
	}
	return d3.extent(tar_arr)
}


d3.tsv(d1, type, function(error, data) {
	data.forEach( function(d){
		d["half_neg_freq"] = -1*(1-(+d.frequency));
		console.log(d.half_neg_freq);
	});
	data["columns"].push("half_neg_freq");

	var extent_x = extent_mult(data);

	console.log(extent_x);

    y.domain(data.map(function(d) { return d.letter; }));
    x.domain(extent_x);

//    chart.select(".y-axis").remove();
    chart.select(".x-axis").remove();

    chart.append("g")
        .attr("class", "y-axis")
     //   .attr("transform", "translate(0," + x(0) + ")")
        .call(d3.axisLeft(y));

    chart.append("g")
        .attr("class", "x-axis")
        .call(d3.axisTop(x).ticks(20, "%"))
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Frequency");
        ;

    var bars = chart.selectAll(".bar")
        .data(data).enter();

    bars.append("rect")
        .attr("class", "bar")
        .attr("y", function(d) { return y(d.letter); })
        .attr("x", function(d) { return x(+d.frequency); })
        .attr("width", function(d) { return x(0)-x(+d.frequency); })
        .attr("height", y.bandwidth());




     bars.append("rect")
        .attr("class", "neg_bar")
        .attr("y", function(d) { return y(d.letter); })
        .attr("x", function(d) { return x(0); })
        .attr("width", function(d) { return x(+d.half_neg_freq)-x(0); })
        .attr("height", y.bandwidth());

});

function type(d) {
  d.frequency = +d.frequency; // coerce to number
  return d;
}
