//TO DO:
// Fix maxPrice setting fn, figure out what to set bar width
// 


var margin = {top: 8, right: 10, bottom: 2, left: 10},
    width = 300 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

var parseDate = d3.timeParse("%b %Y");

var x = d3.scaleTime()
    .range([0, width]);

var y = d3.scaleLinear()
    .range([height, 0]);

/*
var area = d3.area()
    .x(function(d) { return x(d.date); })
    .y0(height)
    .y1(function(d) { return y(d.price); });

var line = d3.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.price); });
*/

function key_funct(d) {
  return d.symbol;
}

function getBandwidth(xdom, arr) {
    xmin = d3.min(arr, function(s) { return s.values[0].date; });
    xmax = d3.max(arr, function(s) { return s.values[s.values.length - 1].date; });
    r = Math.abs(xdom(xmax-xmin));
    console.log(r);
    return (width/r)*2;
}


d3.csv("stocks.csv", type, function(error, data) {

  console.log(data);
  // Nest data by symbol.
  var symbols = d3.nest().key(key_funct).entries(data);

  console.log(symbols);


  // Compute the maximum price per symbol, needed for the y-domain.
  symbols.forEach(function(s) {
//    console.log("S");
//    console.log(s);
    s.maxPrice = d3.max(s.values, function(d) { return d.price; });
  });



  // Compute the minimum and maximum date across symbols.
  // We assume values are sorted by date.
  x.domain([
    d3.min(symbols, function(s) { return s.values[0].date; }),
    d3.max(symbols, function(s) { return s.values[s.values.length - 1].date; })
  ]);

  var bwidth = getBandwidth(x,symbols)
  console.log(bwidth)

  // Add an SVG element for each symbol, with the desired dimensions and margin.
  var svg = d3.select("body").selectAll("svg")
      .data(symbols)
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
      .attr("x", function(d) { return x(d.date);})
      .attr("width", bwidth)
      .attr("y", function(d) { y.domain([0,3000]); return y(d.price); })
      .attr("height", function(d) { return height - y(d.price); });
/*      .attr("class", "bar")
      .attr("x", function(d) { return x(d.date);})
      .attr("width", x(30))
      .attr("y", function(d) { y.domain([0,d.maxPrice]); return y(d.price); })
      .attr("height", function(d) { return height - y(d.price); });*/

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
  // Add a small label for the symbol name.
  svg.append("text")
      .attr("x", width - 6)
      .attr("y", height - 6)
      .style("text-anchor", "end")
      .text(function(d) { return d.key; });
});

function type(d) {
  d.price = +d.price;
  d.date = parseDate(d.date);
  d.symbol = d.symbol;
  return d;
}
