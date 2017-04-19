//HELPERS...
const bisectDate = d3.bisector(d => d.date).left;
var parseDate = d3.timeParse("%Y");
function type_from_radio(value){
  if (value == "percent"){
      return per_type;
  } else {
    if (value == "count"){
      return count_type;
    }
  }
  return filtered_type;
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(rgbstr) {
    var len = rgbstr.length-4;
    var substr = rgbstr.substr(4,len-1);
    color_arr = substr.split(",");
    console.log(color_arr[2]);
    return "#" + componentToHex(+color_arr[0]) + componentToHex(+color_arr[1]) + componentToHex(+color_arr[2]);
}

function file_from_id(chart_id){
  if (chart_id == "#genres"){
    return "genre_count.tsv";
  } else {
    if (chart_id == "#genders"){
      return "gender_count.tsv";
    }
  }
}

function selection_from_id(chart_id){
  var search = "";
  if (chart_id == "#genres"){
    search = "genre-scale";
  } else {
    if (chart_id == "#genders"){
      search = "gender-scale";
    }
  }
  return 'input[name="'+search+'"]:checked';
}

//TOOLTIP HELPERS

function reverse_order(ls){
  target = []
  for(item in ls){
    target.unshift(item);
  }
  return target;
}

function constructData(d_ls){
  tar = [];
  for (d in d_ls){
    item = d_ls[d]["data"];
//    console.log(item);
    tar.push(item);
  }
  return tar;
}

var formatTime = d3.timeFormat("%Y");

function constructTtText(d,k,c){
  console.log(c);
  str = "<strong><h3>&nbsp;"+formatTime(d.date)+"</strong></h3>";
  i = 0;
  reversed = reverse_order(d);
//  console.log(reversed);
  for(entry in reversed){
    field = reversed[entry];
    next = d[field];
    if (((field!="Total") || (d.Total!=1)) && !(isNaN(next))) {
      if (field == k){
        console.log("True! It's true!");
        str = str+'<strong><font size="2" color="'+c+'">';
      }
      if (field != "date"){
        if (d.Total == 1) {
          next = d3.format(".0%")(next);
        }else{
          next = d3.format("1")(next);
        }
        str = str + "&nbsp" + field +": ";
        str = str + next;
        if (field == k){
          str = str + "</font></strong></style>"
        }
        str = str + "<br/>";
      }
    }
    i ++;
  }
  return str+"<br/>";
}


//THE DIFFERENT TYPE FUNCTIONS! FOR SCALING AND STUFF...

function count_type(d, i, columns) {
  d.date = parseDate(d.date);
  var tot = 0
  for (var i = 1, n = columns.length; i < n; ++i){
    d[columns[i]] = +d[columns[i]];
    tot = tot + d[columns[i]]
  } 
  d.Total = tot;
  return d;
}

function per_type(d, i, columns) {
  d.date = parseDate(d.date);
  var tot = 0;
  col = columns.length;
//  console.log(col);
  for (var i = 1; i < col; ++i){
//    console.log(d[columns[i]]);
    tot = tot + (+d[columns[i]]);
  } 
  d.Total = tot;
  for (var i = 1; i < col; ++i){
    if (columns[i] != "Total"){
      d[columns[i]] = (+d[columns[i]])/d.Total;
    }
  } 
  d.Total = 1.0;
//  console.log(d);
  return d;
}

function filtered_type(d, i, columns) {
  d.date = parseDate(d.date);
  var tot = 0;
  col = columns.length;
//  console.log(col);
  for (var i = 1; i < col; ++i){
//    console.log(d[columns[i]]);
    if (columns[i] != "Literary/None"){
      tot = tot + (+d[columns[i]]);
    } else {
      delete d[columns[i]];
    }
  } 
  d.Total = tot;
  for (var i = 1; i < col; ++i){
    if (columns[i] != "Total"){
      d[columns[i]] = (+d[columns[i]])/d.Total;
    }
  } 
  d.Total = 1.0;
  return d;
}

function stackedAreaChart(chart_id,data,type){

  //SET UP ALL THE VARS CAUSE THAT'S WHAT WE'RE DOING HERE
  var svg = d3.select(chart_id).attr("class","chart"),
    margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = svg.attr("width") - margin.left - margin.right,
    height = svg.attr("height") - margin.top - margin.bottom;

  var parseDate = d3.timeParse("%Y");

  var x = d3.scaleTime().range([0, width]),
    y = d3.scaleLinear().range([height, 0]),
    z = d3.scaleOrdinal(d3.schemeCategory20);

  //Make room for a legend on the genres chart
  var squish = .85
  if(chart_id == "#genres"){
    x = d3.scaleTime().range([0, (width * squish)]);
  }

  var stack = d3.stack();

  var formatTime = d3.timeFormat("%e %B");

  var area = d3.area()
    .x(function(d, i) { return x(d.data.date); })
    .y0(function(d) { return y(d[0]); })
    .y1(function(d) { return y(d[1]); });

  //GRAB THE ELEMENT WE'RE PUTTING THE CHART IN
  var g = svg.select("g");

  if (g.empty()){
    g = svg.append("g");
  }

  g.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var keys = data.columns.slice(1);
  x.domain(d3.extent(data, function(d) { return d.date; }));
  y.domain([0,d3.max(data,function(d) { return (+d.Total); })]);
  z.domain(keys);
  stack.keys(keys);

  // TOOLTIP DIVS
  g.select("g").select(".vertical").remove();
  g.select("g").select(".tooltip").remove();


  var div = d3.select("body")
    .append("div") 
      .attr("class", "tooltip")  
      .style("z-index", "190")     
      .style("opacity", 0);

  var vertical = svg.append("g")
    .append("rect")
      .attr("class", "vertical")
      .attr("width", 1)
      .attr("height", height)
      .attr("y", margin.top)
      .attr("x", 0)
      .style("stroke", "#e7e7e7")
      .style("opacity", 0);


  // REMOVE AND DRAW THE AXES
  g.selectAll(".area-label").remove();
  g.select(".fiftyper").remove();
  g.select(".axis--y").remove();
  g.select(".axis--x").remove();

  g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));
    if(type == count_type){
      g.append("g")
          .attr("class", "axis axis--y")
          .call(d3.axisLeft(y).ticks(10));
    } else {
      g.append("g")
          .attr("class", "axis axis--y")
          .call(d3.axisLeft(y).ticks(10, "%"));
    }

// OK NOW WE DRAW

  var layer = g.selectAll(".area")
    .data(stack(data));

  layer.exit().remove();

  var enterLayer = layer.enter()
    .append("path")
      .attr("class", "area")
      .style("fill", function(d) { return z(d.key); })
      .attr("d", area);

// TOOLTIP ACTIONS GO HERE

  enterLayer.on("mousemove", function(d) {
    color = d3.select(this).style("fill");
    color = rgbToHex(color);
    console.log(color);
    d_array = constructData(d);
    k = d.key
    mousex = d3.mouse(this);
    mousex = mousex[0];
    var invertedx = x.invert(mousex);
    var i = bisectDate(d_array, invertedx, 1);

      d0 = d_array[i - 1],
      d1 = d_array[i],
      d = invertedx - d0.date > d1.date - invertedx ? d1 : d0;

    tooltip_text = constructTtText(d,k,color);
    console.log(tooltip_text);

    div.transition()
       .duration(50)
       .style("opacity", .97);
    div.html(tooltip_text)
       .style("left", (d3.event.pageX + 7) + "px")
       .style("top", (d3.event.pageY - 80) + "px");

    vertical.transition()
      .duration(50)
      .attr("x", (x(d.date) + margin.left ))
      .style("opacity", .9);
    })

    .on("mouseout", function(d) {
        div.transition()
          .duration(5000)
          .style("opacity", 0);
        vertical.transition()
          .duration(5000)
          .style("opacity", 0);

    }); 

// MERGE


  layer.merge(enterLayer)
      .transition().duration(1000)
      .style("fill", function(d) { return z(d.key); })
      .attr("d", area);





  if (chart_id == "#genders"){

    g.append("text")
      .data(data.columns)
      .attr("class","area-label")
      .attr("x", .9*width)
      .attr("y", .25*height)
      .style("text-anchor", "end")
      .text("Men");

    g.append("text")
      .data(data.columns)
      .attr("class","area-label")
      .attr("x", .9*width)
      .attr("y", .75*height)
      .style("text-anchor", "end")
      .text("Women");

    if(type == per_type){
      line = g.append("line")
        .attr("class", "fiftyper")
        .attr("x1",x(parseDate("1950")))
        .attr("y1",y(.5))
        .attr("x2",x(parseDate("2017")))
        .attr("y2",y(.5))
        .style("stroke", "white")
        .style("stroke-width", 3);
    }
  }

  if (chart_id == "#genres"){
    svg.append("g")
      .attr("class", "legendOrdinal")
      .attr("transform", "translate("+squish*1.09*width+","+1.5*margin.top+")");

    var legendOrdinal = d3.legendColor()
  //d3 symbol creates a path-string, for example
  //"M0,-8.059274488676564L9.306048591020996,
  //8.059274488676564 -9.306048591020996,8.059274488676564Z"
        .shape("path", d3.symbol().type(d3.symbolSquare).size(150)())
        .shapePadding(10)
  //use cellFilter to hide the "e" cell
        .cellFilter(function(d){ return d.label !== "e" })
        .scale(z)
        .ascending(true);

    svg.select(".legendOrdinal")
      .call(legendOrdinal);

  }

}

function update(filen,typefn,chart_id){
  d3.tsv(filen, typefn, function(error, data) {
      if (error) throw error;
      stackedAreaChart(chart_id,data,typefn);
  });
}

var genre_dat = "genre_count.tsv",
gender_dat = "gender_count.tsv";

update(genre_dat,per_type,"#genres");
update(gender_dat,per_type,"#genders");

function transition(chart_id){
  selection = selection_from_id(chart_id);
  value = d3.select(selection).node().value;
  type = type_from_radio(value);
  file = file_from_id(chart_id);
  update(file,type,chart_id);
}








////SMALL MULTIPLES TIME...I ALSO NEED TO LABEL THEM


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


function smallMultiples(data, chart_id){
  var margin = {top: 25, right: 20, bottom: 35, left: 50},
    width = 75 + margin.left + margin.right,
    height = 75 + margin.top + margin.bottom;

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

  var genres = d3.nest().key(key_funct).entries(data);

  genres.forEach(function(s) {
    for (i=0; i<s.values.length; i++){
      item = s.values[i]
      item.perMen = 1+(-1*(+item.percent));
    }
    s.maxMen = d3.min(s.values, function(d) { return d.perMen; });
    s.maxWomen = d3.max(s.values, function(d) { return d.percent; });
    for (i=0; i<s.values.length; i++){
      item = s.values[i]
      item.maxWomen = s.maxWomen;
      item.maxMen = s.maxMen;
    }
  });

  // Hardcoding my axis extents
  y.domain([parseDate("1950"),parseDate("2020")]);
  x.domain(d3.extent([-1, 1]));


  // Grab the div to put the small multiples in
  container = d3.select("#smult");
  container.style("width", "900px");

  // Add an SVG element for each genre, with the desired dimensions and margin.
  var svg = container.selectAll("svg.mult").data(genres)
    .enter().append("svg")
      .attr("class","mult")
      .attr("height", height + margin.top + margin.bottom)
      .attr("width", width + margin.left + margin.right)
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

  bars.append("text")
    .attr("class", "value")
    .attr("y", function(d) { return (y(d.decade) + getBandwidth(y,data)/2 +5);})
    .attr("x", function(d) {
        if (d.percent >= d.perMen){
          return x(-1 * (+d.percent - .04));
        } else {
          return x(+d.perMen - .04);
        }
    })
//    .attr("alignment-baseline","central")
    .attr("text-anchor", function(d){
      if (d.percent >= d.perMen){
          return "end";
        } else {
          return "start";
        }
    })
    .text(function(d){
        if (d.percent >= d.perMen){
          return d3.format(".0%")(d.percent);
        } else {
          return d3.format(".0%")(d.perMen);
        }
    });

  console.log(bars);

  svg.append("g")
    .attr("class", "axis axis--y")
    .call(d3.axisLeft(y).ticks(7));

  svg.append("g")
    .attr("class", "axis axis--x")
    .call(d3.axisTop(x).ticks(6, "%"));

// Add a small label for the genre name.
    svg.append("text")
      .attr("y", height + 15)
      .attr("x", width - 6)
      .style("text-anchor", "end")
      .style("font-weight","bold")
      .text(function(d) { return d.key; });

    svg.append("line")
      .attr("y1", y(parseDate("1950")))
      .attr("x1", x(0))
      .attr("y2", y(parseDate("2020")))
      .attr("x2", x(0))
      .style("stroke", "black");

    console.log("smults!",svg);

    // ATTACH LABELS TO THE FIRST SMULT 

    g = svg._groups[0][0];
    g = d3.select(g);

    g.append("text")
      .attr("y", height*1/3)
      .attr("x", width*3/4)
      .style("text-anchor", "middle")
      .text("Women");

    g.append("text")
      .attr("y", height*1/3)
      .attr("x", width*1/4)
      .style("text-anchor", "middle")
      .text("Men");
}



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

d3.tsv("smult_data.tsv", smult_type, function(error, data) {

  smallMultiples(data,"#smult");
});
