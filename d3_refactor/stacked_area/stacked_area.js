var svg = d3.select("svg"),
    margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = svg.attr("width") - margin.left - margin.right,
    height = svg.attr("height") - margin.top - margin.bottom;

var parseDate = d3.timeParse("%Y %b %d");

var x = d3.scaleTime().range([0, width]),
    y = d3.scaleLinear().range([height, 0]),
    z = d3.scaleOrdinal(d3.schemeCategory10);

var stack = d3.stack();

var area = d3.area()
    .x(function(d, i) { return x(d.data.date); })
    .y0(function(d) { return y(d[0]); })
    .y1(function(d) { return y(d[1]); });

var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var datastr = "data2.tsv",
other_data_str = "data.tsv";

function render(dstring){
  d3.tsv(dstring, type, function(error, data) {
    if (error) throw error;

    var keys = data.columns.slice(1);

    x.domain(d3.extent(data, function(d) { return d.date; }));


    y.domain([0,d3.max(data,function(d) { return (+d.Male) + (+d.Female); })]);

    z.domain(keys);
    stack.keys(keys);

    console.log(data);

    g.select(".fiftyper").remove();

    var layer = g.selectAll(".area")
      .remove()
      .exit()
      .data(stack(data));

    layer.enter().append("path")
        .transition().duration(750)
        .attr("class", "area")
        .style("fill", function(d) { return z(d.key); })
        .attr("d", area);

/*    layer.filter(function(d) { return d[d.length - 1][1] - d[d.length - 1][0] > 0.01; })
      .append("text")
        .attr("x", width - 6)
        .attr("y", function(d) { return y((d[d.length - 1][0] + d[d.length - 1][1]) / 2); })
        .attr("dy", ".35em")
        .style("font", "10px sans-serif")
        .style("text-anchor", "end")
        .text(function(d) { return d.key; });*/

/*    layer.append("line")
      .attr("x1",x(parseDate("1950 Jan 1")))
      .attr("y1",y(.5))
      .attr("x2",x(parseDate("2017 Jan 1")))
      .attr("y2",y(.5))
      .style("stroke", "red");*/

    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    g.select(".axis--y").remove();
    g.select(".axis--x").remove();


    if(dstring == "data2.tsv"){
      g.append("g")
          .attr("class", "axis axis--y")
          .call(d3.axisLeft(y).ticks(10));
    } else {
      g.append("g")
          .attr("class", "axis axis--y")
          .call(d3.axisLeft(y).ticks(10, "%"));
      g.append("line")
        .attr("class", "fiftyper")
        .attr("x1",x(parseDate("1950 Jan 1")))
        .attr("y1",y(.5))
        .attr("x2",x(parseDate("2017 Jan 1")))
        .attr("y2",y(.5))
        .style("stroke", "red");
    }

  });
}

render(datastr);

var color = "blue", color2="white";

function transition() {
  var t;
  t = datastr, datastr = other_data_str, other_data_str = t;
//  c = color, color=color2, color2=c;
//  d3.select("body").style("background-color", color);
  render(datastr);
}

function type(d, i, columns) {
  d.date = parseDate(d.date);
  for (var i = 1, n = columns.length; i < n; ++i) d[columns[i]] = d[columns[i]];
  return d;
}
