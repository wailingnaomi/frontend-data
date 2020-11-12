
const endpoint = 'https://opendata.rdw.nl/resource/m9d7-ebf2.json'

const svg = d3.select('svg');

const width = +svg.attr('width');
const height = +svg.attr('height');

const render = data => {
    const xValue = d => d.population;
    const yValue = d => d.country;
    const margin = {top: 20, right: 40, bottom: 20, left: 100};
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const xscale = d3.scaleLinear()
    //minimum en maximum voor de domain
        .domain([0, d3.max(data, xValue)])
        //breedte van de x-as
        .range([0, innerWidth]);
        
    
    //bandScale is voor de bars
    const yscale = d3.scaleBand()
        // loop door yValue voor de landnamen
        .domain(data.map(yValue))
        //hoogte van de y-as
        .range([0, innerHeight])
        .padding(0.1);

    const yAxis = d3.axisLeft(yscale);

    //groep element g maken
    const g = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`)

        g.append('g').call(d3.axisLeft(yscale));
        g.append('g').call(d3.axisBottom(xscale))
            .attr('transform', `translate(0, ${innerHeight})`)

    //maak d3 data join
    g.selectAll('rect').data(data)
        // maakt bars voor elke rij
        .enter()
        .append('rect')
            .attr('y', d => yscale(yValue(d))) // berekend de y attributes
            .attr('width', d => xscale(xValue(d)))
            .attr('height', yscale.bandwidth()) //is de breedte van de bar
};


//data inladen met promise
d3.csv('data.csv').then(data => {
    //van string naar nummers
    data.forEach(d => {
        d.population = +d.population * 1000; // de + converteert strings naar nummers (https://stackoverflow.com/questions/15704128/how-can-i-efficiently-convert-data-from-string-to-int-within-a-d3-method-chain)
    });
    render(data);
})