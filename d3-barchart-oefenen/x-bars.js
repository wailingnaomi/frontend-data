const endpoint = 'https://opendata.rdw.nl/resource/m9d7-ebf2.json'

const svg = d3.select('svg');

//zet strings om naar nummers
const width = +svg.attr('width');
const height = +svg.attr('height');

const render = data => {
    const xValue = d => d.country;
    const yValue = d => d.population;
    const margin = {top: 20, right: 40, bottom: 20, left: 200};
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    //per kleur bar maken
    const xscale = d3.scaleBand()
    //minimum en maximum voor de domain
        .domain(data.map(xValue))
        //breedte van de x-as
        .range([0, innerWidth])
        .padding(0.1);
        
    
    //hoogte van de aantallen geven
    const yscale = d3.scaleLinear()
        // loop door yValue voor de landnamen
        .domain([0, d3.max(data, yValue)])
        //hoogte van de y-as
        .range([innerHeight, 0])
        

    const xAxis = d3.axisBottom(xscale);

    //groep element g maken
    const g = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`)

        g.append('g').call(d3.axisLeft(yscale));
        g.append('g').call(d3.axisBottom(xscale))
            //x-as naar beneden halen ipv boven
            .attr('transform', `translate(0, ${innerHeight})`)

    //de bars maken
    g.selectAll('rect').data(data)
        .enter()
        .append('rect')
            .attr('x', d => xscale(xValue(d))) // berekend de x attributes
            .attr('y', d => yscale(yValue(d))) // berekend de y attributes
            .attr('height', d => innerHeight - yscale(yValue(d))) 
                .attr('width', xscale.bandwidth())
            
};


//data inladen met promise
d3.csv('data.csv').then(data => {
    //van string naar nummers
    data.forEach(d => {
        d.population = +d.population; // de + converteert strings naar nummers (https://stackoverflow.com/questions/15704128/how-can-i-efficiently-convert-data-from-string-to-int-within-a-d3-method-chain)
    });
    render(data);
})