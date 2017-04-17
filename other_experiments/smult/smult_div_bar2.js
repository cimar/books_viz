//TO DO:
// Fix maxPrice setting fn, figure out what to set bar height
// 


var margin = {top: 8, right: 10, bottom: 2, left: 10},
    width = 300 - margin.left - margin.right,
    height = 160 - margin.top - margin.bottom;

var parseDate = d3.timeParse("%Y");

var y = d3.scaleTime()
    .range([0, height]);

var x = d3.scaleLinear()
    .range([width, 0]);

/*
var area = d3.area()
    .y(function(d) { return y(d.date); })
    .y0(width)
    .y1(function(d) { return x(d.percent); });

var line = d3.line()
    .y(function(d) { return y(d.date); })
    .x(function(d) { return x(d.percent); });
*/

function key_funct(d) {
  return d.genre;
}

/*function getBandwidth(xdom, arr) {
    xmin = d3.min(arr, function(s) { return s.values[0].date; });
    xmax = d3.max(arr, function(s) { return s.values[s.values.length - 1].date; });
    r = Math.abs(xdom(xmax-xmin));
    console.log(r);
    return (height/r)*2;
}*/


d3.tsv("the_data.tsv", type, function(error, data) {

  console.log(data);
  // Nest data by genre.
  var genres = d3.nest().key(key_funct).entries(data);

  console.log(genres);


  // Compute the maximum percent per genre, needed for the x-domain.
  genres.forEach(function(s) {
//    console.log("S");
//    console.log(s);
    for (i=0; i<s.values.length; i++){
      item = s.values[i]
      item.perMen = 1+(-1*(+item.percent));
    }
    s.maxMen = d3.min(s.values, function(d) { return d.perMen; });
    s.maxWomen = d3.max(s.values, function(d) { return d.percent; });
    //console.log(s);
    for (i=0; i<s.values.length; i++){
      item = s.values[i]
      item.maxWomen = s.maxWomen;
      item.maxMen = s.maxMen;
    }
  });

function getBandwidth(xdom, arr) {
    r = xdom(2);
    console.log(r);
    return (width/r)*2;
}

  //console.log(genres);
  //console.log(genres[4]);

  // when do you use data.map?
  //
  // Compute the minimum and maximum date across genres.
  // We assume values are sorted by date.
  y.domain([parseDate("1950"),parseDate("2015")]);

  console.log(genres[1].values.map(function(d) { return d.decade; }));
  // Add an SVG element for each genre, with the desired dimensions and margin.
  var svg = d3.select("body").selectAll("svg")
      .data(genres)
    .enter().append("svg")
      .attr("class","mult")
      .attr("height", height + margin.left + margin.right)
      .attr("width", width + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var bars = svg.selectAll(".bar")
      .data(function(d) { return d.values;})
    .enter();

  bars.append("rect")
      .attr("class", "bar")
      .attr("y", function(d) { console.log(y(d.decade));return y(d.decade);})
      .attr("height", 20) // MAKE A BANDWIDTH FN
      .attr("x", function(d) { x.domain(d3.extent([-1, 1])); return x(0); })
      .attr("width", function(d) { return x(0) - x(d.percent); });

  bars.append("rect")
    .attr("class", "neg_bar")
    .attr("y", function(d) { return y(d.decade);})
    .attr("height", 20)
    .attr("x", function(d) { x.domain(d3.extent([-1, 1])); return x(d.perMen); })
    .attr("width", function(d) { return Math.abs(x(0) - x(d.perMen)); });
/*      .attr("class", "bar")
      .attr("y", function(d) { return y(d.date);})
      .attr("height", y(30))
      .attr("x", function(d) { x.domain([0,d.maxPrice]); return x(d.percent); })
      .attr("width", function(d) { return width - x(d.percent); });*/

  console.log(bars);

/*
  // Add the area path elements. Note: the x-domain is set per element.
  svg.append("path")
      .attr("class", "area")
      .attr("d", function(d) { x.domain([0, d.maxPrice]); return area(d.values); });

  // Add the line path elements. Note: the x-domain is set per element.
  svg.append("path")
      .attr("class", "line")
      .attr("d", function(d) { x.domain([0, d.maxPrice]); return line(d.values); });
*/
  // Add a small label for the genre name.
  svg.append("text")
      .attr("y", height - 6)
      .attr("x", width - 6)
      .style("text-anchor", "end")
      .text(function(d) { return d.key; });
});

function type(d) {
  count_women = +d.count;
  count_total = count_women/(+d.percent);
  if ((d.genre!="zz_needs label") && (count_total > 10)) {
    d.percent = +d.percent;
    d.decade = parseDate(d.decade);
    d.genre = d.genre;
    return d;
  }
}
