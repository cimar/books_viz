/// TO DO:

////  Guideline??
//// 

////  OPTIONAL: Dynamic filtering? 
////  (using the below for scaling might make filtering easier)
////
////  http://stackoverflow.com/questions/16351244/convert-result-to-percentage-in-d3 

////  Draw the controls in the SVG

const bisectDate = d3.bisector(d => d.date).left;

var svg = d3.select("svg").attr("class","chart"),
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

var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var datastr = "genre_count.tsv",
other_data_str = "gender_count.tsv";

// Define the div for the tooltip

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

function constructTtText(d){
//  console.log(d);
  str = "";
  i = 0;
  reversed = reverse_order(d);
//  console.log(reversed);
  for(entry in reversed){
    field = reversed[entry];
    next = d[field];
    //if ((field != "needs label") && (field != "No") && (field != "needs_label")) {
      if (field != "date"){
        if (cp_now == "percent") {
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
  //}
  return str;
}

var div = d3.select("#genre-container").append("div") 
  .attr("class", "tooltip")       
  .style("opacity", 0);

var vertical = d3.select("body")
      .append("div")
      .attr("class", "vertical")
      .style("position", "absolute")
      .style("z-index", "19")
      .style("width", "1px")
      .style("height", height+"px")
      .style("top", margin.top+9+"px")
      .style("left", "0px")
      .style("background", "#e7e7e7");


function update(dstring, count_or_per){
  if(count_or_per == "count"){
    type=count_type;
  }else{
    if (count_or_per == "percentage"){
      type=per_type;
    }else{
      type = filtered_type
    }
  }

  d3.tsv(dstring, type, function(error, data) {
    var data = data;
//    console.log(data);
//    console.log(datastr);
    if (error) throw error;

/*    data.forEach(function(d){
      console.log(d);
    });*/

    var keys = data.columns.slice(1);
    x.domain(d3.extent(data, function(d) { return d.date; }));
    y.domain([0,d3.max(data,function(d) { return (+d.Total); })]);
    z.domain(keys);
    stack.keys(keys);

///// REMOVE AND DRAW THE AXES

    g.select(".fiftyper").remove();
    g.select(".axis--y").remove();
    g.select(".axis--x").remove();

    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    if(dstring == "genre_count.tsv"){
      g.append("g")
          .attr("class", "axis axis--y")
          .call(d3.axisLeft(y).ticks(10));
    } else {
      g.append("g")
          .attr("class", "axis axis--y")
          .call(d3.axisLeft(y).ticks(10, "%"));
      g.append("line")
        .transition()
        .attr("class", "fiftyper")
        .attr("x1",x(parseDate("1950 Jan 1")))
        .attr("y1",y(.5))
        .attr("x2",x(parseDate("2017 Jan 1")))
        .attr("y2",y(.5))
        .style("stroke", "black");
    }

    var layer = g.selectAll(".area")
      .data(stack(data));

    layer.exit().remove();

    var enterLayer = layer.enter()
      .append("path")
        .attr("class", "area")
        .style("fill", function(d) { return z(d.key); })
        .attr("d", area);

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

      tooltip_text = constructTtText(d);
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
        .style("left", x(d.date) + margin.left + 8 + "px" ); 

      })

      .on("mouseout", function(d) {
          div.transition()
            .duration(500)
            .style("opacity", 0);
      }); 

    layer.merge(enterLayer)
        .transition().duration(1000)
        .style("fill", function(d) { return z(d.key); })
        .attr("d", area);

  });
}

var cp_now = "percentage";
update(datastr,cp_now);

var color = "blue", color2="white";


function transition() {
  var t;
//  d3.select
  console.log("inside transition!");
  //t = cp_now, cp_now = cp_later, cp_later = t;
  cp_now = d3.select('input[name="scale"]:checked').node().value;
  console.log("val...",cp_now);
//  c = color, color=color2, color2=c;
//  d3.select("body").style("background-color", color);
  update(datastr,cp_now);
}

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
//  console.log(d);
  return d;
}
