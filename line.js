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

var input = [
  {
    'values': [[631180800, 0.4511278195], [315561600, 0.2153846154], [-315590400, 0.5454545455], [28800, 0.4], [946713600, 0.4693877551], [-631123200, 0.1666666667], [1262332800, 0.4423076923]], 
    'key': 'mystery'
  }, 
  {
    
      'values': [[631180800, 0.1388888889], [315561600, 0.15], [-315590400, null], [28800, null], [946713600, 0.0857142857], [-631123200, null], [1262332800, 0.1818181818]], 
    'key': 'fsf'
  }, 
  {
    
      'values': [[631180800, 0.2857142857], [315561600, 0.1], [-315590400, null], [28800, null], [946713600, 0.5510204082], [-631123200, null], [1262332800, 0.5111111111]], 
    'key': 'horror'
  }, 
  {
    'values': [[631180800, 0.7619047619], [315561600, 0.76], [-315590400, 0.1], [28800, 0.2666666667], [946713600, 0.7701149425], [-631123200, 0.6111111111], [1262332800, 0.7179487179]], 
    'key': 'domestic'
  }, 
  {
    
      'values': [[631180800, 0.037037037], [315561600, 0.0625], [-315590400, 0.05], [28800, 0.0857142857], [946713600, 0.0263157895], [-631123200, 0.25], [1262332800, 0.03125]], 
    'key': 'spy_and_politics'
  }, 
  {
    'values': [[631180800, 0.8024691358], [315561600, 0.8367346939], [-315590400, 0.619047619], [28800, 0.5789473684], [946713600, 0.8305084746], [-631123200, 0.3714285714], [1262332800, 0.8055555556]], 
    'key': 'romance'
  }, 
  {
    'values': [[631180800, 0.1111111111], [315561600, 0.037037037], [-315590400, 0.24], [28800, 0.25], [946713600, 0.3076923077], [-631123200, 0.2692307692], [1262332800, 0.2692307692]], 
    'key': 'other'
  }, 
  {
    
      'values': [[631180800, 0.1578947368], [315561600, null], [-315590400, null], [28800, null], [946713600, 0.2526315789], [-631123200, null], [1262332800, 0.1851851852]], 
    'key': 'suspense'
  }, 
  {
    'values': [[631180800, 0.1041666667], [315561600, 0.1212121212], [-315590400, null], [28800, 0.0], [946713600, 0.1578947368], [-631123200, 0.1071428571], [1262332800, 0.1]], 
    'key': 'adventure'
  }, 
  {'values': [[631180800, 0.4583333333], [315561600, 0.4210526316], [-315590400, null], [28800, null], [946713600, 0.5185185185], [-631123200, 0.3684210526], [1262332800, 0.84]], 
    'key': 'historical'}, 
  {
    'values': [[631180800, 0.3585746102], [315561600, 0.2818991098], [-315590400, 0.244047619], [28800, 0.2845849802], [946713600, 0.471620227], [-631123200, 0.2635135135], [1262332800, 0.4629812438]], 
    'key': 'literary fiction/no genre'
  }
];


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
//      if (y != null) {
      subtar['x'] = x;
      subtar['y'] = y;
      target.push(subtar);
//      }
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

