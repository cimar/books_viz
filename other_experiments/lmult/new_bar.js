function type(d) {
  d.frequency = +d.frequency;
  return d;
}

function type2(d) {
  d.frequency = (1/2)*(+d.frequency);
  return d;
}

function barChart(chart_id,data){
	var svg = d3.select(chart_id),
    margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom;

	var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
    	y = d3.scaleLinear().rangeRound([height, 0]);

	var g = svg.select("g");

	if (g.empty()){
		g = svg.append("g");
	}
	g.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	x.domain(data.map(function(d) { return d.letter; }));
	y.domain([0, d3.max(data, function(d) { return d.frequency; })]);

    g.select(".x-axis").remove();
    g.select(".y-axis").remove();

	g.append("g")
	.attr("class", "axis axis--x")
	.attr("transform", "translate(0," + height + ")")
	.call(d3.axisBottom(x));

	g.append("g")
	.attr("class", "axis axis--y")
	.call(d3.axisLeft(y).ticks(10, "%"))
	.append("text")
	.attr("transform", "rotate(-90)")
	.attr("y", 6)
	.attr("dy", "0.71em")
	.attr("text-anchor", "end")
	.text("Frequency");

    var bars = g.selectAll(".bar")
        .data(data);

//    bars.exit().remove();

    var enterBars = bars.enter()
      .append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.letter); })
        .attr("y", function(d) { return y(d.frequency); })
        .attr("height", function(d) { return height - y(d.frequency); })
        .attr("width", x.bandwidth());

     bars.merge(enterBars)
      .transition().duration(2000)
        .attr("x", function(d) { return x(d.letter); })
        .attr("y", function(d) { return y(d.frequency); })
        .attr("height", function(d) { return height - y(d.frequency); })
        .attr("width", x.bandwidth());
}

d3.tsv("bar2.tsv", type, function(error, data) {
  if (error) throw error;
  barChart("#bar1",data);
});

function update(filen,typefn,chart_id){
	d3.tsv(filen, typefn, function(error, data) {
	  	if (error) throw error;
  		barChart(chart_id,data);
	});
}

var d1 = "bar.tsv", d2 = "bar2.tsv"

update(d1,type2,"#bar2");

function transition(chart_id){
  t = d1, d1 = d2, d2 = t;
  console.log(d1);
  update(d1,type2,chart_id);
}
