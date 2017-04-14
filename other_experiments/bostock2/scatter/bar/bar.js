var d1 = "bar.tsv", d2 = "bar2.tsv"

var margin = {top: 20, right: 30, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
    y = d3.scaleLinear().rangeRound([height, 0]);

var chart = d3.select(".chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Define the div for the tooltip
var div = d3.select("body").append("div") 
    .attr("class", "tooltip")       
    .style("opacity", 0);


function update(dfile){
  d3.tsv(dfile, type, function(error, data) {
    x.domain(data.map(function(d) { return d.letter; }));
    y.domain([0, d3.max(data, function(d) { return d.frequency; })]);

    chart.select(".x-axis").remove();
    chart.select(".y-axis").remove();

    chart.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    chart.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(y).ticks(10, "%"))
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Frequency");
        ;

    var bars = chart.selectAll(".bar")
        .data(data);

    var enterBars = bars.enter()
      .append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.letter); })
        .attr("y", function(d) { return y(d.frequency); })
        .attr("height", function(d) { return height - y(d.frequency); })
        .attr("width", x.bandwidth());

    enterBars.on("mouseover", function(d) {
      div.transition()
         .duration(200)
         .style("opacity", .9);
      div.html(d.letter + "<br/>" + d.frequency)
         .style("left", (d3.event.pageX) + "px")
         .style("top", (d3.event.pageY - 28) + "px");
      })
      .on("mouseout", function(d) {
          div.transition()
            .duration(500)
            .style("opacity", 0);
      });

    bars.merge(enterBars)
      .transition().duration(2000)
        .attr("x", function(d) { return x(d.letter); })
        .attr("y", function(d) { return y(d.frequency); })
        .attr("height", function(d) { return height - y(d.frequency); })
        .attr("width", x.bandwidth());
  });
}

function type(d) {
  d.frequency = +d.frequency; // coerce to number
  return d;
}

update(d1)

function transition(){
  t = d1, d1 = d2, d2 = t;
  update(d1)
}


//SVG DEMO WORKS OK
//I still don't really get the "update" thing, though

/*var data1 = [4, 8, 15, 16, 23, 42];
var data2 = [30,400,60,30,110,500]


var width = 420,
    barHeight = 20;


function update(dd){
  var chart = d3.select(".chart")
    .attr("width", width)
    .attr("height", barHeight * dd.length);

  var x = d3.scaleLinear() //
    .domain([0, d3.max(dd)]) //has "data"
    .range([0, width]);

  var bar = chart.selectAll(".bar")
    .remove()
    .exit()
    .data(dd);

  console.log(bar);

  //bar.exit().remove();

  bar.enter()
      .append("rect")
      .attr("class","bar")
      .attr("width", x)
      .attr("height", barHeight - 1)
    .merge(bar)
      .attr("transform", function(d, i) { return "translate(0," + i * barHeight + ")"; });



}

     //has "data"
update(data1);

function transition(){
  temp = data1,data1 = data2, data2 = temp;
  update(data1);
}

*/

/*
// HTML DEMO, WORKING UPDATE FN
//

var data1 = [4, 8, 15, 16, 23, 42];
var data2 = [30,400,60,30,110,500]


var chart = d3.select(".chart");

function update(dd){
  var x = d3.scaleLinear()
    .domain([0, d3.max(dd)])
    .range([0, 420]);

  var rect = chart.selectAll("div")
      .data(dd);

  rect.exit().remove();

  rect.enter().append("div")
    .merge(rect)
      .style("width", function(d) { return x(d) + "px"; })
      .text(function(d) { return d; });
}

update(data1);

function transition(){
  temp = data1,data1 = data2, data2 = temp;
  update(data1);
}
*/
