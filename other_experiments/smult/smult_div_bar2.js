//TO DO:
// Fix maxPrice setting fn, figure out what to set bar height
// 


  var parseDate = d3.timeParse("%Y");


/*function getBandwidth(xdom, arr) {
    xmin = d3.min(arr, function(s) { return s.values[0].date; });
    xmax = d3.max(arr, function(s) { return s.values[s.values.length - 1].date; });
    r = Math.abs(xdom(xmax-xmin));
    console.log(r);
    return (height/r)*2;
}*/


function smallMultiples(data){

  var margin = {top: 25, right: 10, bottom: 15, left: 10},
    width = 300 - margin.left - margin.right,
    height = 200 - margin.top - margin.bottom;


  var y = d3.scaleTime()
      .range([0, height]);

  var x = d3.scaleLinear()
      .range([width, 0]);

  function getBandwidth(dom, arr) {
      r = dom(parseDate("2020")) - dom(parseDate("1950"));
      console.log(arr);
      return r/7.0 -5;
  }

  function key_funct(d) {
    return d.genre;
  }




  
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

  //console.log(genres);
  //console.log(genres[4]);

  // when do you use data.map?
  //
  // Compute the minimum and maximum date across genres.
  // We assume values are sorted by date.
  y.domain([parseDate("1950"),parseDate("2020")]);
  x.domain(d3.extent([-1, 1]));

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
      .attr("y", function(d) { return y(d.decade);})
      .attr("height", getBandwidth(y,data)) // MAKE A BANDWIDTH FN
      .attr("x", function(d) { return x(0); })
      .attr("width", function(d) { return x(0) - x(d.percent); });

  bars.append("rect")
    .attr("class", "neg_bar")
    .attr("y", function(d) { return y(d.decade);})
    .attr("height", getBandwidth(y,data))
    .attr("x", function(d) { return x(d.perMen); })
    .attr("width", function(d) { return Math.abs(x(0) - x(d.perMen)); });

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

  svg.append("g")
    .attr("class", "axis axis--y")
    .attr("transform", "translate(" + x(0) + ","+7+")")
    .call(d3.axisLeft(y).ticks(7, ""));

  svg.append("g")
    .attr("class", "axis axis--x")
    .call(d3.axisTop(x).ticks(6, "%"));

    svg.append("text")
      .attr("y", height - 16)
      .attr("x", width - 6)
      .style("text-anchor", "end")
      .style("font-weight","bold")
      .text(function(d) { return d.key; });

    svg.append("text")
      .attr("y", 15)
      .attr("x", width*3/4)
      .style("text-anchor", "left")
      .text("Percent Women");

    svg.append("text")
      .attr("y", 15)
      .attr("x", width*1/4)
      .style("text-anchor", "end")
      .text("Percent Men");
}

d3.tsv("the_data.tsv", smult_type, function(error, data) {
  smallMultiples(data);
});

function smult_type(d) {
  count_women = +d.count;
  count_total = count_women/(+d.percent);
  if ((d.genre!="zz_needs label") && (count_total > 10)) {
    d.percent = +d.percent;
    d.decade = parseDate(d.decade);
    d.genre = d.genre;
    return d;
  }
}
