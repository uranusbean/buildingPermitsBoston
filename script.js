console.log('Boston Permit project');
var zipTable = {
  2125: 'Dorchester Uphams Corner',
  2119: 'Roxbury',
  2124: 'Dorchester Center',
  2115: 'Fenway',
  2122: 'Dorchester',
  2116: 'Back Bay',
  2127: 'South Boston',
  2126: 'Mattapan',
  2129: 'Charlestown',
  2132: 'West Roxbury',
  2110: 'Downtown Crossing',// 'Downtown crossing/ financial district',
  2109: 'Faneuil Hall',// 2109: 'Faneuil Hall marketplace/ north end',
  2128: 'East Boston',
  2118: 'South End',
  2135: 'Brighton',
  2121: 'Dorchester Grove Hall',
  2113: 'Hanover Street',// 2113: 'Hanover Street/ north end',
  2131: 'Roslindale',
  2130: 'Jamaica Plain',
  2134: 'Allston',
  2136: 'Hyde Park',
  2111: 'Chinatown', // 2111: 'Chinatown/ Tufts Medical',
  2120: 'Mission Hill',// 2120: 'Roxbury Mission Hill',
  2108: 'Beacon  Hill',
  2210: 'West Broadway',// 2210: 'West Broadway/ South Boston',
  2215: 'Kenmore',
  2467: 'Brookline',
  2114: 'West End',
  2199: 'Prudential',
  2163: 'Boston Allston'
};

var zipArray = [];

var m = {t:50,r:50,b:50,l:50},
w = document.getElementById('canvas').clientWidth,
h = document.getElementById('canvas').clientHeight;

var margin = 10, r = 50;
var formatValue = d3.format(".2s");

var scaleX = d3.scaleLinear()
  .domain([2009,2016])
  // .domain([parseInt(2009),parseInt(2016)])
  .range([0,w/3]);
var scaleY = d3.scaleLinear()
  .domain([0,2000000000])
  .range([h/3,0]);

//Axis
var axisX = d3.axisBottom()
  .scale(scaleX)
  .tickSize(3)
  .ticks(8);
var axisY = d3.axisLeft()
  .scale(scaleY)
  .tickSize(-w);

var plot = d3.select('.canvas')
  .append('svg')
  .attr('width', w + m.l + m.r)
  .attr('height', 1.1*h + m.t + m.b)
  .append('g')
  .attr('transform','translate('+ m.l+','+ m.t+')');

var timelineChart = d3.select('.canvas')
  .append('svg')
  .attr('width', w/2 + m.l + m.r)
  .attr('height', h/2 + m.t + m.b)
  .append('g')
  .attr('transform','translate('+ m.l+','+ m.t+')');

// var scaleColor = d3.scaleOrdinal().range(d3.schemeCategory20c);
var scaleColor = d3.scaleOrdinal()
    .range(['#E57373','#BA68C8','#7986CB','#64B5F6','#4FC3F7','#FF8A65','#4DB6AC',
            '#81C784','#AED581','#DCE775','#FFF176','#FFD54F','#bec72c']);
var yearFormat = d3.timeFormat('%Y');

var pie = d3.pie()
  .value(function(d){return d.value;});

var arc = d3.arc()
  .startAngle(function(d){
  return d.startAngle;
})
  .endAngle(function(d){
  return d.endAngle;
})
  .innerRadius(r * 0.8)
  .outerRadius(r);

//Line generator
var lineGenerator = d3.line()
  .x(function(d){return scaleX(parseInt(d.key));})
  .y(function(d){return scaleY(d.value);})
  .curve(d3.curveCardinal);

d3.queue()
  .defer(d3.csv,'data/Approved_Building_Permits.csv',parse)
  .await(dataloaded);


function dataloaded(err, data){
  //--------NEST BY ZIP AND YEAR---------
  var permitByZipYear = d3.nest()
    .key(function(d){return d.zip})
    .key(function(d){return yearFormat(d.issueDate);})
    .rollup(function(values){
      return d3.sum(values,function(d){return d.budget})
    })
    .entries(data);

  for (var i = 0; i < permitByZipYear.length; i++) {
    permitByZipYear[i].values.sort(function(a,b){
      return a.key - b.key;
    });
  }

  //--------NEST BY ZIP AND TYPE---------
  var permitByZipType = d3.nest()
    .key(function(d){
      return d.zip
    })
    .key(function(entry){
      return entry.permitTypeDescr;
    })
    .rollup(function(values){
      return d3.sum(values,function(d){return d.budget})
    })
    .entries(data);
  // console.log(permitByZipType);

  //--------FIND MAX & MIN DATES--------
  function sortDates(a, b){return a.getTime() - b.getTime();}
  var issueDates = [], expireDates = [];
  for (var i = 0; i < data.length; i++) {
    if(yearFormat(data[i].issueDate) < 2008) {
      continue;
    }
    issueDates.push(new Date(data[i].issueDate));
  }
  for (var i = 0; i < data.length; i++) {
    expireDates.push(new Date(data[i].expireDate));
  }
  var issueDatesSorted = issueDates.sort(sortDates),
      expireDatesSorted = expireDates.sort(sortDates);

  var minIssueDate = issueDatesSorted[0],
      maxIssueDate = issueDatesSorted[issueDatesSorted.length-1];

  var minExpireDate = expireDatesSorted[0],
      maxExpireDate = expireDatesSorted[expireDatesSorted.length-1];

  // console.log(minIssueDate);
  // console.log(maxIssueDate);
  // console.log(minExpireDate);
  // console.log(maxExpireDate);

  //--------SET SCALEX DOMAIN-----------
  // scaleX.domain([parseInt(yearFormat(minIssueDate)),parseInt(yearFormat(maxIssueDate))]);

  //--------GET THE SUM OF BUDGET OF EACH TYPE -------
  for (var i = 0; i < permitByZipType.length; i++) {
    var sum = 0;
    for (var j = 0; j < permitByZipType[i].values.length; j++) {
      var budgetByZipType = permitByZipType[i].values[j].value;
      sum = sum + budgetByZipType;
    }
    permitByZipType[i].sum = sum;
  }
  // console.log(permitByZipType);
  var sortedSum = permitByZipType.sort(function(a,b){
    return b.sum - a.sum;
  });
  console.log(sortedSum);
  // scaleY.domain([sortedSum]);

  //ENTER
  var count = 0;
  for (var i = 0; i < permitByZipType.length; i++) {
    let zip = permitByZipType[i].key;
    let type = permitByZipType[i].values;
    if(zip < 2000 || zip > 3000){
      continue;
    }
    if(type.length <= 10) {
      continue;
    }
    // console.log(sortedPermitByZip[i]);

    let colId = count % 5;
    let rowId = Math.floor(count / 5);
    // console.log(sortedPermitByZipType[i].values);

    var piechart = plot.append('g')
      .attr('class','pieChart')
      .attr('transform',
      'translate(' + (2 * colId + 1) * (r + 2.5*margin) + ','
      + (2 * rowId + 1) * (r + 2.5* margin) + ')');

    piechart.selectAll('path')
            .data(pie(permitByZipType[i].values))
            .enter()
            .append('path')
            .attr('d',arc)
            // .style('fill',function(d,i){return scaleColor(i)});
            .style('fill',function(d,i){return scaleColor(d.data.key)}); //each category has specific color

    piechart.append('text')
            .attr('transform','translate(0, 70)')
            .text(function(){
              // console.log(zipTable[zip]);
              return zipTable[zip];})
            .style('text-anchor', 'middle')
            .style('cursor', 'pointer')
            .style('fill','#eee')
            .on('click',function(d,i){
              // console.log($(this).html()); //get the neighbourhood name
              for (var keyZip in zipTable){
                if(zipTable[keyZip] == $(this).html()) {
                  // console.log(keyZip);
                  drawTimeline(zip,permitByZipYear);
                }
              }
            });

    piechart.append('text')
            .text(function(){return formatValue(permitByZipType[i].sum);})
            .style('fill','#eee')
            .style('text-anchor', 'middle');

    piechart.on('click',function(d){
      $('svg:first-child').css('margin-left','0');
      $('svg:nth-last-child(1)').css('visibility','visible');
      // if($('svg:nth-last-child(1)').css('visibility') == 'hidden'){
      //   $('svg:nth-last-child(1)').css('visibility','visible')
      // } else $('svg:nth-last-child(1)').css('visibility','hidden')
    });

    count = count + 1; //46
  } // end of for loop


  // TOOLTIP
  var slices = plot.selectAll('path');

  slices.on('mouseenter',function(d){
    var tooltip = d3.select('.custom-tooltip');

    tooltip.select('.title').html(d.data.key);
    tooltip.select('.value').html('$'+formatValue(d.data.value));

    tooltip
      .style('visibility','visible')
      .transition()
      .style('opacity',1);

    d3.select(this).transition().style('opacity',1);
  }).on('mousemove',function(d){
      var xy = d3.mouse(d3.select('.container').node());
      var tooltip = d3.select('.custom-tooltip')
      .style('left',xy[0]+20+'px')
      .style('top',xy[1]+20+'px');

  }).on('mouseleave',function(d){
      var tooltip = d3.select('.custom-tooltip');
      tooltip
      .style('visibility','hidden')
      .style('opacity',0);

      d3.select(this).transition().style('opacity',.7);
  });
}

function drawTimeline(zip, permitByZipYear){
  //Draw axis
  timelineChart.append('g').attr('class','axis axis-x')
      .attr('transform','translate(20,'+h/3+')')
      .style('stroke','#c3c3c3')
      .call(axisX);
  timelineChart.append('g').attr('class','axis axis-y')
      .attr('transform','translate(20,0)')
      .style('stroke','#c3c3c3')
      .call(axisY);

  for (var i = 0; i < permitByZipYear.length; i++) {
    zipArray.push(permitByZipYear[i].key);
  }
  // console.log(zipArray);

  var data;
  var index = zipArray.indexOf(zip);

  data = permitByZipYear[index].values;

  // Draw dots
  var node = timelineChart.selectAll('.node')
    .data(data);
    // .data(permitByZipYear[0].value);

  //ENTER
  var nodeEnter = node.enter()
    .append('circle')
    .attr('transform','translate(20,0)')
    .attr('class','node')
    .style('stroke','none')
    .on('click',function(d,i){
      //  console.log(d);
      //  console.log(i);
      console.log(this);
   });

  //UPDATE+ ENTER
  nodeEnter
     .merge(node)
     .attr('cx',function(d){
      //  console.log(d);
       return scaleX(parseInt(d.key));
     })
     .attr('cy',function(d){
       return scaleY(d.value);
     })
     .attr('r',5)
     .style('fill','#eee')
     .style('opacity',1);

   //EXIT
    node.exit().remove();

    //Apend the <path>
    timelineChart.append('path')
      .attr('class','time-series');
    //Draw <path>
    timelineChart.select('.time-series')
      .datum(data)
      // .datum(permitByZipYear[0].values)
      .transition()
      .attr('d',function(array){
          return lineGenerator(array);
      })
      .attr('transform','translate(20,0)')
      .style('fill','none')
      .style('stroke-width','2px')
      .style('stroke','#c3c3c3');
}

function parse(d){
  var entry = {
    permitNumber: d.PermitNumber,
    permitTypeDescr: d.PermitTypeDescr,
    description: d.DESCRIPTION,
    budget: d.DECLARED_VALUATION.slice(1) == '' ? 0 : (+d.DECLARED_VALUATION.slice(1)), //remove $
    issueDate: new Date(d.ISSUED_DATE),
    expireDate: new Date(d.EXPIRATION_DATE),
    status: d.STATUS,
    city: d.CITY,
    zip: d.ZIP == ''? 0 : (+d.ZIP),
    neighbourhood: d.ZIP == ''? '' : zipTable[d.ZIP]
  };
  return entry;

}
