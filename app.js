var app = angular.module("infoVizApp", ["rzModule"]);

app.controller("infoVizCtrl", function($scope, $http) {

    $scope.statistics = {
        percentage : 100,
        numberOfMan : 0,
        numberOfWoman : 0,
        numberOfSurvived : 0,
        numberOfDeath : 0
    };

    $scope.priceSlider = {
      min: 0,
      max: 0,
      options: {
        id : "price-slider",
        floor: 0,
        ceil: 0,
        vertical: true,
        onChange : priceSliderValueChange
      },
    };


    $scope.ageSlider = {
      min: 0,
      max: 0,
      options: {
        id : "age-slider",
        floor: 0,
        ceil: 0,
        onChange : ageSliderValueChange
      },
    };

    $scope.limits = {
      maxAge: -1,
      minAge: 100,
      maxPrice : -1,
      minPrice : 10000
    }

    $scope.options = {
        showFemale : true,
        showMale  : true,
        showSurvived : true,
        showDead : true
    };

    $scope.dataset = [];

    function priceSliderValueChange(sliderId, modelValue, highValue, pointerType){
        console.log(sliderId + " -- " + modelValue + " -- " + highValue + " -- " + pointerType);
        $scope.limits.minPrice = modelValue;
        $scope.limits.maxPrice = highValue;
        $scope.redrawChart();
    }

    function ageSliderValueChange(sliderId, modelValue, highValue, pointerType){
        console.log(sliderId + " -- " + modelValue + " -- " + highValue + " -- " + pointerType);
        $scope.limits.minAge = modelValue;
        $scope.limits.maxAge = highValue;
        $scope.redrawChart();
    }


    $scope.redrawChart = function(){
        createGraph();
        $scope.drawChart();
    }


    var margin = {top: 20, right: 15, bottom: 20, left: 60}
         , width = 730 - margin.left - margin.right
         , height = 550 - margin.top - margin.bottom;


    var g;
    var x;
    var y;

    // Define the div for the tooltip
    var divTooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    function createGraph(){

        d3.select("svg").remove();

        x = d3.scaleLinear()
                  .domain([$scope.limits.minAge, $scope.limits.maxAge])
                  .range([ 0, width ]);

        y = d3.scaleLinear()
        	      .domain([$scope.limits.minPrice, $scope.limits.maxPrice])
        	      .range([ height, 0 ]);


       var chart = d3.select('#chart-container')
               	.append('svg:svg')
               	.attr('width', width + margin.right + margin.left)
               	.attr('height', height + margin.top + margin.bottom)
               	.attr('class', 'chart')

       var main = chart.append('g')
             	.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
             	.attr('width', width)
             	.attr('height', height)
             	.attr('class', 'main')

       // draw the x axis
       var xAxis = d3.axisBottom()
             	.scale(x);

       main.append('g')
     	.attr('transform', 'translate(0,' + height + ')')
     	.attr('class', 'main axis date')
     	.call(xAxis);

       // draw the y axis
       var yAxis = d3.axisLeft()
             	.scale(y);

       main.append('g')
   	.attr('transform', 'translate(0,0)')
   	.attr('class', 'main axis date')
   	.call(yAxis);

     g = main.append("svg:g")
                   .attr("class", "dot-container");

    }


    $scope.drawChart = function(){

        var dataArray = getDataArray();

        g.selectAll("circle").remove();
        g.selectAll("rect").remove();

        var maleData = dataArray.filter(d => d.sex === "female");
        var femaleData = dataArray.filter(d => d.sex === "male");

        console.log("Male data : " + maleData.length + " Female data : " + femaleData.length)

        if(femaleData.length > 0){

          g.selectAll("circle")
            .data(femaleData)
            .enter().append("circle")
                .attr("cx", function (d,i) { return x( d.age ); } )
                .attr("cy", function (d) { return y( Math.ceil(d.price) ); } )
                .attr("r", 3)
                .attr("class", function (d) {
                    if(d.survived == 1){
                        return "alive";
                    }
                    return "dead";
                });

        }

        if(maleData.length > 0){
          g.selectAll("rect")
            .data(maleData)
            .enter().append("rect")
                .attr("x", function (d) { return x( d.age ); } )
                .attr("y", function (d) { return y( Math.ceil(d.price) ); } )
                .attr("width", 5)
                .attr("height", 5)
                .attr("class", function (d) {
                    if(d.survived == 1){
                        return "alive";
                    }
                    return "dead";
                });
        }



    }
/*
$scope.options = {
    showFemale : true,
    showMale  : true,
    showSurvived : true,
    showDead : true
};
*/
    function getDataArray(){
      //Filters data array
      var dataArray = $scope.dataset.filter(
        d => d.age >= $scope.limits.minAge &&
             d.age <= $scope.limits.maxAge &&
             d.price >= $scope.limits.minPrice &&
             d.price <= $scope.limits.maxPrice
      );

      if($scope.options.showFemale === false){
          console.log("filter female");
          dataArray = dataArray.filter(d => d.sex === "female");
      }

      if($scope.options.showMale === false){
          console.log("filter male");
          dataArray = dataArray.filter(d => d.sex === "male");
      }

      if($scope.options.showSurvived === false){
          console.log("filter survived");
          dataArray = dataArray.filter(d => d.survived !== 1);
      }

      if($scope.options.showDead === false){
          console.log("filter dead");
          dataArray = dataArray.filter(d => d.survived !== 0);
      }

      calculateStatistics(dataArray);

      return dataArray;
    }


/*
$scope.statistics = {
    percantage : 100,
    numberOfMan : 0,
    numberOfWoman : 0,
    numberOfSurvived : 0,
    numberOfDeath : 0
};
*/

    function calculateStatistics(dataArray){
        var percentage = (dataArray.length * 100 / $scope.dataset.length).toFixed(2);
        var numberOfMan = 0;
        var numberOfWoman = 0;
        var numberOfSurvived = 0;
        var numberOfDeath = 0;

        dataArray.forEach(function(e) {
            if(e.sex === "female"){
              numberOfMan = numberOfMan + 1;
            }else if(e.sex === "male"){
              numberOfWoman = numberOfWoman + 1;
            }

            if(e.survived === 1){
              numberOfSurvived = numberOfSurvived + 1;
            }else{
              numberOfDeath = numberOfDeath + 1;
            }
        });

        $scope.statistics.count = dataArray.length;
        $scope.statistics.percentage = percentage;
        $scope.statistics.numberOfMan = numberOfMan;
        $scope.statistics.numberOfWoman = numberOfWoman;
        $scope.statistics.numberOfSurvived = numberOfSurvived;
        $scope.statistics.numberOfDeath = numberOfDeath;
    }

    //
    // File Parsing
    //

    function parseDataFile(data){
        var lines = data.split("\n");
        //removes header line
        lines.shift();
        lines.forEach(function(line) {
            var tokens = line.split("\t");
            var obj = createDataObject(tokens[0],tokens[1],tokens[2],tokens[3],tokens[4],tokens[5]);
            updateDataLimits(obj);
            $scope.dataset.push(obj);
        });
        updateSlidersLimits();
        setCurrentSliderValues();
        console.log("Size of data set : " + $scope.dataset.length );
        console.log("First data object : " + JSON.stringify($scope.dataset[0]) );
        console.log("Limits : " + JSON.stringify($scope.limits));
    }

    function setCurrentSliderValues(){
        $scope.priceSlider.min = $scope.priceSlider.options.floor;
        $scope.priceSlider.max = $scope.priceSlider.options.ceil;
        $scope.ageSlider.min  = $scope.ageSlider.options.floor
        $scope.ageSlider.max  = $scope.ageSlider.options.ceil;
    }

    function updateSlidersLimits(){
        $scope.priceSlider.options.floor = $scope.limits.minPrice;
        $scope.priceSlider.options.ceil  = Math.ceil($scope.limits.maxPrice);

        $scope.ageSlider.options.floor  = $scope.limits.minAge;
        $scope.ageSlider.options.ceil = $scope.limits.maxAge;
    }

    function updateDataLimits(data){
        if($scope.limits.maxAge < data.age){
            $scope.limits.maxAge = data.age;
        }

        if($scope.limits.minAge > data.age){
            $scope.limits.minAge = data.age;
        }

        if($scope.limits.maxPrice < data.price){
            $scope.limits.maxPrice = data.price
        }

        if($scope.limits.minPrice > data.price){
            $scope.limits.minPrice = data.price
        }
    }

    function createDataObject(pclass, survived, name, sex, age, price){
        return{
            pclass : Number(pclass),
            survived : Number(survived),
            name : name,
            sex : sex,
            age : Number(age),
            price : Number(price)
        };
    }

    $http.get("titanic.tsv")
    .then(function(response) {
        parseDataFile(response.data);
        createGraph();
        $scope.drawChart();
    });


});
