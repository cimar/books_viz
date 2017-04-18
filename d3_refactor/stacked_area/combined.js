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

function file_from_id(chart_id){
  if (chart_id == "#genres"){
    return "genre_count.tsv";
  } else {
    if (chart_id = "#genders"){
      return "gender_count.tsv";
    }
  }
}

function selection_from_id(chart_id){
  var search = "";
  if (chart_id == "#genres"){
    search = "genre-scale";
  } else {
    if (chart_id = "#genders"){
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

function constructTtText(d,type){
//  console.log(d);
  str = "";
  i = 0;
  reversed = reverse_order(d);
//  console.log(reversed);
  for(entry in reversed){
    field = reversed[entry];
    next = d[field];
    if ((field!="Total") || (type!=per_type)) {
      if (field != "date"){
        if (type == "per_type") {
          next = d3.format(".0%")(next);
        }else{
          next = d3.format("1")(next);
        }
        str = str + field +": ";
      } else {
        str = str + "Year: "
        next = formatTime(next)
      }
      str = str + next;
      str = str + "<br/>";
    }
    i ++;
  }
  return str;
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
    if ((columns[i] != "zz_no genre") && (columns[i] != "zz_needs label")){
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
    console.log(d);
    d_array = constructData(d);
    console.log(d_array);
    k = d.key
    mousex = d3.mouse(this);
    mousex = mousex[0];
    var invertedx = x.invert(mousex);
    var i = bisectDate(d_array, invertedx, 1);
    console.log(i);

      d0 = d_array[i - 1],
      d1 = d_array[i],
      d = invertedx - d0.date > d1.date - invertedx ? d1 : d0;

    tooltip_text = constructTtText(d,type);
    console.log(tooltip_text);

    div.transition()
       .duration(50)
       .style("opacity", .9);
    div.html(tooltip_text)
       .style("left", (d3.event.pageX + 7) + "px")
       .style("top", (d3.event.pageY - 28) + "px");

    console.log(d.date);
    vertical.transition()
      .duration(50)
      .attr("x", (x(d.date) + margin.left ))
      .style("opacity", .9);
    })

    .on("mouseout", function(d) {
        div.transition()
          .duration(500)
          .style("opacity", 0);
        vertical.transition()
          .duration(500)
          .style("opacity", 0);

    }); 

// MERGE

  layer.merge(enterLayer)
      .transition().duration(1000)
      .style("fill", function(d) { return z(d.key); })
      .attr("d", area);

  if ((chart_id == "#genders") && (type == per_type)){
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
