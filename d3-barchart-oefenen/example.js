const endpoint = "https://opendata.rdw.nl/resource/ixf8-gtwq.json";

// http://learnjsdata.com/read_data.html
d3.json(endpoint).then(function(data){
    // console.log(data[0])

    d3.select("body") // select body
        .selectAll("p") // select p in the body
        .data(data) // data() passes on the data values from our dataset to the next method in the chain
        .enter() // receives the values from data()
        .append("p") // adds p
        .text(function(d){
            return d.daytimeframe
        })
})

