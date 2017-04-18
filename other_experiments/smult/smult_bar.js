//TO DO:
// Fix maxPrice setting fn, figure out what to set bar width
// 


var margin = {top: 8, right: 10, bottom: 2, left: 10},
    width = 300 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

var parseDate = d3.timeParse("%b %Y");

var x = d3.scaleBand()
    .range([0, width]);

var y = d3.scaleLinear()
    .range([height, 0]);

/*
var area = d3.area()
    .x(function(d) { return x(d.date); })
    .y0(height)
    .y1(function(d) { return y(d.frequency); });

var line = d3.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.frequency); });
*/

function key_funct(d) {
  return d.group;
}

/*function getBandwidth(xdom, arr) {
    xmin = d3.min(arr, function(s) { return s.values[0].date; });
    xmax = d3.max(arr, function(s) { return s.values[s.values.length - 1].date; });
    r = Math.abs(xdom(xmax-xmin));
    console.log(r);
    return (width/r)*2;
}*/


d3.tsv("bar3.tsv", type, function(error, data) {

  console.log(data);
  // Nest data by group.
  var groups = d3.nest().key(key_funct).entries(data);

  console.log(groups);


  // Compute the maximum frequency per group, needed for the y-domain.
  groups.forEach(function(s) {
//    console.log("S");
//    console.log(s);
    for (i=0; i<s.values.length; i++){
      item = s.values[i]
      item.negFreq = -1*(0.15-(+item.frequency));
    }
    s.minFreq = d3.min(s.values, function(d) { return d.negFreq; });
    s.maxFreq = d3.max(s.values, function(d) { return d.frequency; });
    console.log(s);
    for (i=0; i<s.values.length; i++){
      item = s.values[i]
      item.maxFreq = s.maxFreq;
      item.minFreq = s.minFreq;
    }
  });

  console.log(groups);
  console.log(groups[0]);

  // when do you use data.map?
  //
  // Compute the minimum and maximum date across groups.
  // We assume values are sorted by date.
  x.domain(groups[0].values.map(function(d) { return d.letter; }));


  console.log(x.domain);
  // Add an SVG element for each group, with the desired dimensions and margin.
  var svg = d3.select("body").selectAll("svg")
      .data(groups)
    .enter().append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var bars = svg.selectAll(".bar")
      .data(function(d) { return d.values;})
    .enter();

  bars.append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.letter);})
      .attr("width", x.bandwidth())
      .attr("y", function(d) { y.domain(d3.extent([d.minFreq, d.maxFreq])); return y(d.frequency); })
      .attr("height", function(d) { return y(0) - y(d.frequency); });

  bars.append("rect")
    .attr("class", "neg_bar")
    .attr("x", function(d) { return x(d.letter);})
    .attr("width", x.bandwidth())
    .attr("y", function(d) { y.domain(d3.extent([d.minFreq, d.maxFreq])); return y(0); })
    .attr("height", function(d) { return Math.abs(y(0) - y(d.negFreq)); });
/*      .attr("class", "bar")
      .attr("x", function(d) { return x(d.date);})
      .attr("width", x(30))
      .attr("y", function(d) { y.domain([0,d.maxPrice]); return y(d.frequency); })
      .attr("height", function(d) { return height - y(d.frequency); });*/

  console.log(bars);

/*
  // Add the area path elements. Note: the y-domain is set per element.
  svg.append("path")
      .attr("class", "area")
      .attr("d", function(d) { y.domain([0, d.maxPrice]); return area(d.values); });

  // Add the line path elements. Note: the y-domain is set per element.
  svg.append("path")
      .attr("class", "line")
      .attr("d", function(d) { y.domain([0, d.maxPrice]); return line(d.values); });
*/
  // Add a small label for the group name.
  svg.append("text")
      .attr("x", width - 6)
      .attr("y", height - 6)
      .style("text-anchor", "end")
      .text(function(d) { return d.key; });
});

function type(d) {
  d.frequency = +d.frequency;
  /*d.date = parseDate(d.date);
  d.group = d.group;*/
  return d;
}
