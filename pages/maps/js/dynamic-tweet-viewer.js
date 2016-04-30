function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
    vars[key] = value;
});
return vars;
}

var layerIDs = [];
var colors20 = d3.scale.category20();
var filterGroup = document.getElementById('filter-group');
var filters = [];
var brush = d3.svg.brush();

function updateFilters(){
    filters = ["all"]

    if (!brush.empty()){
        filters.push([">=", "timeInt", brush.extent()[0].getTime()])
        filters.push(["<=", "timeInt", brush.extent()[1].getTime()])
        //map.setFilter("tweetLayer", filters);
        
        document.getElementById("brush-bounds").innerHTML = "<h4 style='float:left;margin-left:5px'>"+brush.extent()[0].toISOString()+"</h4>" + 
            "<h4 style='float:right;margin-right:5px;'>"+brush.extent()[1].toISOString()+"</h4>";
       
    }
    
    var checkedBoxes = document.querySelectorAll('input[type=checkbox]:checked');

    if (checkedBoxes.length > 0){
        inclusion = ["in","user"]
        _.map(checkedBoxes, function(b){
            inclusion.push(b.id.toString())
        })
        filters.push(inclusion)
    }
    map.setFilter("tweetLayer",filters)
    console.log(map.getLayer("tweetLayer"))
    //console.log(map.getLayer("tweetLayer").getBounds())
    //map.fitBounds(.getBounds())
}

function setBrush(data) {
    var container = d3.select('#brush'),
        width = container.node().offsetWidth,
        margin = {top: 0, right: 0, bottom: 0, left: 0},
        height = 50;

    var timeExtent = d3.extent(data.features, function(d) {
        return d.properties.time;
    });

    var svg = container.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom);

    var context = svg.append('g')
        .attr('class', 'context')
        .attr('transform', 'translate(' +
            margin.left + ',' +
            margin.top + ')');

    var x = d3.time.scale()
        .range([0, width])
        .domain(timeExtent);

    brush.x(x)
         .on('brushend', updateFilters);

    context.selectAll('circle')
        .data(data.features)
        .enter()
        .append('circle')
        .attr('transform', function(d) {
            return 'translate(' + [x(d.properties.time), height / 2] + ')';
        })
        .attr('r', 10)
        .attr('opacity', 0.5)
        .attr('stroke', '#fff')
        .attr('stroke-width', 0.5)
        .attr('fill', function(d){return colors20(d.properties.user)});

    context.append('g')
        .attr('class', 'x brush')
        .call(brush)
        .selectAll('rect')
        .attr('y', -6)
        .attr('height', height);
}

map.on('style.load', function(){
    
    var dataset = getUrlVars()['dataset'] || '../sample_data/tweets_in_redhook.geojson'
    console.log("Dataset: " + dataset)
        
    d3.json(dataset, function(err, tweets) {
        
        tweets.features = tweets.features.map(function(d) {
            d.properties.time = new Date(d.properties.time);
            d.properties.timeInt = d.properties.time.getTime();
            d.properties.layerColor = colors20(d.properties.user);
            return d;
        })
        
        var grouped      = _.groupBy(tweets.features,function(d){return d.properties.user})
        var users_with_counts = _.reverse(_.sortBy(_.map(grouped,function(k,v){return {user: v, tweets: grouped[v].length}}),function(d){return d['tweets']}))
        
        users_with_counts.forEach(function(obj,idx){
            var input = document.createElement('input');
                input.type = 'checkbox';
                input.id = obj['user'];
                input.checked = false;
                filterGroup.appendChild(input);

            var label = document.createElement('label');
                label.setAttribute('for', obj['user']);
                label.textContent = obj['user'] + " | " +obj['tweets'];
                filterGroup.appendChild(label);
            
                input.addEventListener('change', function(e) {
                    updateFilters()
                });
        })

        // Add marker data as a new GeoJSON source.
        map.addSource("tweets", {
            "type": "geojson",
            "data": tweets,
        });
        
        map.addLayer({
            "id": "tweetLayer",
            "type": "circle",
            "source": "tweets",
            "paint": {
                "circle-color": "blue",
                "circle-opacity": 0.75,
                "circle-radius": 5}
            
            //"filter": ["==", "user", user]
        });
        
        setBrush(tweets)
        map.jumpTo({center:[-74.0094,40.6773], zoom:12});
    });
});

// When a click event occurs near a marker icon, open a popup at the location of
// the feature, with description HTML from its properties.
map.on('click', function (e) {
    var features = map.queryRenderedFeatures(e.point, { layers: ["tweetLayer"] });

    if (!features.length) {
        return;
    }

    var feature = features[0];

    // Populate the popup and set its coordinates
    // based on the feature found.
    var popup = new mapboxgl.Popup()
        .setLngLat(feature.geometry.coordinates)
        .setHTML(
            "<table><tr><td>User: </td><td>"+feature.properties.user+"</td></tr>"+
                "<tr><td>Time: </td><td>"   +feature.properties.time+"</td></tr>"+
                "<tr><td>Text: </td><td>"   +feature.properties.text+"</td></tr></table>")
        .addTo(map);
});

map.on('mousemove', function (e) {
    var features = map.queryRenderedFeatures(e.point, { layers: ["tweetLayer"] });
    map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';
});
