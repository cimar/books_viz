/*These lines are all chart setup.  Pick and choose which chart features you want to utilize. */
var chart2
nv.addGraph(function() {
  chart2 = nv.models.lineChart()
                .margin({left: 100})  //Adjust chart margins to give the x-axis some breathing room.
                .useInteractiveGuideline(true)  //We want nice looking tooltips and a guideline!
                .transitionDuration(350)  //how fast do you want the lines to transition?
                .showLegend(true)       //Show the legend, allowing users to turn on/off line series.
                .showYAxis(true)        //Show the y-axis
                .showXAxis(true)        //Show the x-axis
  ;

  chart2.xAxis     //Chart x-axis settings
      .axisLabel('Year')
      .tickFormat(function(d) { return d3.time.format('%x')(new Date(d*1000)) });

  chart2.yAxis     //Chart y-axis settings
      .tickFormat(d3.format('.02f'));

  /* Done setting the chart up? Time to render it!*/
  var myData = that_data();   //You need data...

  d3.select('#chart3 svg')    //Select the <svg> element you want to render the chart in.   
      .datum(myData)         //Populate the <svg> element with chart data...
      .call(chart2);          //Finally, render the chart!

  //Update the chart when window resizes.
  nv.utils.windowResize(function() { chart2.update() });
  return chart2;
});
/**************************************
 * Simple test data generator
 */
function that_data() {

var input = [{'values': [[631180800, 0.4285714286], [315561600, 0.0588235294], [-315590400, 'None'], [28800, 0.8181818182], [946713600, 0.2142857143], 
[-631123200, 'None'], [1262332800, 'None']], 
'key':'mystery'}, 
 {'values': [[631180800, 0.3764404609], [315561600, 0.2928571429], [-315590400, 0.236318408], 
[28800, 0.2380952381], [946713600, 0.4679767103], [-631123200, 0.2333333333], [1262332800, 0.428359317]], 
'key':'no genre'},
{'values': [[631180800, 0.1111111111], [315561600, 0.1162790698], [-315590400, 'None'], [28800, 0.0909090909], [946713600, 0.1612903226], 
[-631123200, 'None'], [1262332800, 'None']], 
'key':'fsf'}, 
{'values': [[631180800, 'None'], [315561600, 'None'], [-315590400, 'None'], [28800, 'None'], [946713600, 'None'],
 [-631123200, 'None'], [1262332800, 'None']], 
 'key':'ya'}, 
 {'values': [[631180800, 0.0], [315561600, 0.0769230769], [-315590400, 'None'], [28800, 0.0909090909], [946713600, 0.0], [-631123200, 'None'], 
 [1262332800, 'None']], 
 'key':'spy_and_politics'}, 
 {'values': [[631180800, 0.2222222222], [315561600, 0.05], [-315590400, 'None'], [28800, 'None'], [946713600, 0.4375], [-631123200, 'None'], 
 [1262332800, 'None']], 
 'key':'horror'}, 
 {'values': [[631180800, 1.0], [315561600, 'None'], [-315590400, 'None'], [28800, 'None'], [946713600, 'None'], 
 [-631123200, 'None'], [1262332800, 'None']], 
 'key':'domestic'}, 
 {'values': [[631180800, 0.875], [315561600, 'None'], [-315590400, 'None'], [28800, 'None'], [946713600, 0.8666666667], 
 [-631123200, 'None'], [1262332800, 0.8333333333]], 
 'key':'romance'}, 
 {'values': [[631180800, 0.1071428571], [315561600, 0.0], [-315590400, 'None'], [28800, 'None'], [946713600, 0.0769230769], 
 [-631123200, 'None'], [1262332800, 'None']], 
 'key':'adventure'}];

function compare(a, b) {
    if (a['x'] < b['x']) return -1;
    if (a['x'] > b['x']) return 1;
    return 0;
}

function compare1(a, b) {
    if (a[0] < b[0]) return -1;
    if (a[0] > b[0]) return 1;
    return 0;
}

  function process_points(point_ls){
    point_ls.sort(compare1);
    var target = [];
    for (var i = 0; i < point_ls.length; i++){
      var subtar = {};
      var x = point_ls[i][0];
      var y = point_ls[i][1];
      if (y != 'None') {
        subtar['x'] = x;
        subtar['y'] = y;
        target.push(subtar);
      }
    }
//    target.sort(compare);
    return target;
  }

  function process_input(input_ls){
    var target = [];
    for (series in input_ls){
        var sub_tar = {};
        sub_tar["key"] = input_ls[series]["key"];
        sub_tar["values"] = process_points(input_ls[series]["values"]);
        if (sub_tar["values"].length > 0){
          target.push(sub_tar);
        }
    }
    return target;
 }

 hurricane = process_input(input)
 console.log(hurricane)
  //Line chart data should be sent as an array of series objects.
  return hurricane;
}

