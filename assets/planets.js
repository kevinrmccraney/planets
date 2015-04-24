w = 6000;
h = 300;
maxRadius = 100;

//draws the vector space itself, to be populated later
var svg = d3.select("body")
    .append("svg");

svg.attr("width", w)
    .attr("height", h);

//draws a background rectangle the same size as the svg to represent space
var rect = svg.append("rect")
    .attr("width", w)
    .attr("height", h)
    .attr("background-color", "black");

// gets data from the planets.csv file in the project directory
// everything that happens after enter is called is called for each instance of an object
d3.csv("assets/planets.csv", function(data){
    var planets = svg.selectAll("circle.planet")
    .data(data).enter();

//calls everything following enter for every element in the previously defined array
    var maxDistance = d3.max(data, function(d){
        return parseFloat(d.distance_from_sun);
    });
    var maxPlanetRadius = d3.max(data, function(d) {
        return d.diameter/2;
    });

// the following 2 functions are self explanatory, scaling the distance from the sun and radius linearly
var distanceFromSunScale = d3.scale.linear()
    .domain([0, maxDistance])
    .range([0, w - maxRadius]);

var radiusScale = d3.scale.linear()
    .domain([0, maxPlanetRadius])
    .range([0, maxRadius]);

//take a deep breath; this draws the planets and then does a whole bunch of other stuff
// planets has to be re-instantiated here, which is why planets = planets
planets = planets
    .append("circle")
    .classed("planet", true) //shortcut to add a class to whatever selection had
    .attr("cy", h/2)
    .attr("r", 30)
    //when setting attributes, we can pass in a function and a static element; in this, we get index for free here
    .attr("cx", function(d, i) { return (i+1) * maxRadius; })
    .style("fill", function(d){return d.color;});


// for readability, i split the click and mouseover functions
//this is click-to-zoom functionality, and it has a built-in toggle function
planets
    .on("click", function(d){
        var active = planets.active ? false: true,
            newRadius = active ? 30 : function(d) {
                return radiusScale(d.diameter/2);},
            newX = active ? function(d, i) {
                return (i+1) * maxRadius;} : function(d) { return distanceFromSunScale(d.distance_from_sun);};
        planets.transition()
        //duration and delay are in ms
            .duration(2000)
            .delay(500)
            .attr("cy", h/2)
            .attr("r", newRadius)
            .attr("cx", newX);
            planets.active = active;
        });

//and this is mouseover; this modifies the tooltip in the upper right corner
planets
    .on("mouseover", function(d){
        d3.select(this)
        .attr("stroke-width", "3px")
        .attr("stroke", "white")
        .attr('class', function(d) {
            return document.getElementById("planetname")
                .innerHTML = d.name + ",<br>" + d.diameter + "km in diameter,<br>" +
                d.distance_from_sun + "x 10<sup>6</sup> km from the sun."
                ;})
        ;})
    .on("mouseout", function(d){
        d3.select(this)
        .attr("stroke-width", "0")
        .attr('class', function(d) {
            return document.getElementById("planetname")
                .innerHTML = "This is your solar system.<br>Single-click to toggle zoom.<br>Hover a planet for more information."
                ;});
    });
});