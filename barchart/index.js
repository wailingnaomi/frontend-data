// Endpoint geeft de dataset GEKENTEKENDE VOERTUIGEN: https://opendata.rdw.nl/Voertuigen/Open-Data-RDW-Gekentekende_voertuigen/m9d7-ebf2
//Data selecteren die ik gebruik
const endpoint = 'https://opendata.rdw.nl/resource/m9d7-ebf2.json'
const colorColumn = 'kleur'
const brandColumn = 'merk'

//array's voor de barchart
let data
let allColors
let allBrands

// settings voor de barchart, de + zet strings om naar nummers
const svg = d3.select('svg');
const width = +svg.attr('width');
const height = +svg.attr('height');
const margin = {
    top: 100,
    right: 40,
    bottom: 20,
    left: 100
};
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

//x en de y schalen
let xscale = d3.scaleBand().padding(0.5); //scaleBand is voor de bars
let yscale = d3.scaleLinear()

const xValue = d => d.key;
const yValue = d => d.value;

//groep element g maken
let g = svg
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)


const render = data => {
    //setup x schaal
    xscale.domain(data.map(xValue)) // loop door xValue voor de keys
    xscale.range([0, innerWidth]) //breedte van de x-as

    //setup y schaal
    yscale.domain([0, d3.max(data, yValue)]) //minimum en maximum voor de domain
    yscale.range([innerHeight, 0]) //hoogte van de y-as

    //setup x as
    g.append('g')
        .attr("class", "axis-x")
        .call(d3.axisBottom(xscale))
        .attr('transform', `translate(0, ${innerHeight})`);

    //setup y as
    g.append('g')
    .attr("class", "axis-y")
        .call(d3.axisLeft(yscale)
            .ticks(10));

    //bars maken
    g.selectAll('rect')
        .data(data)
        .enter() // maakt bars voor elke rij
        .append('rect')
        .attr('x', d => xscale(xValue(d))) // berekend de x attributes
        .attr('y', d => yscale(yValue(d))) // berekend de y attributes
        .attr('width', xscale.bandwidth())
        .attr('height', d => innerHeight - yscale(yValue(d)))

}

d3.json(endpoint).then(data => {
    console.log("ruwe data", data)

    //filter personenauto
    const specificCarType = autos(data, "Personenauto")
    console.log("filteren: data van alleen personenauto", specificCarType)

    //transformeer de data naar alleen kleur en merk
    const transform = transformData(specificCarType)

    //data ophalen van een kleur kolom
    const colorColumnArray = filterData(transform, colorColumn)
    console.log("alle data van kleuren", colorColumnArray)

    //data ophalen van merk kolom
    const brandColumnArray = filterData(transform, brandColumn)
    console.log("alle data van merken", brandColumnArray)

    //laat zien hoeveel unieke waardes er zijn van de kleuren
    const amountColors = countUnique(colorColumnArray)
    console.log("tel de kleuren", amountColors)

    //laat zien hoeveel unieke waardes er zijn van de merken
    const amountBrands = countUnique(brandColumnArray)
    console.log("tel de merken", amountBrands)

    //zet de getelde kleuren in array
    allColors = newArray(amountColors)
    console.log("transformeren part 2: alle kleuren in nieuwe array", allColors)

    //zet de getelde merken in array
    allBrands = newArray(amountBrands)
    console.log("transformeren part 2: alle merken in nieuwe array", allBrands)

    render(allColors)
    setupInput()
})

//Geeft een nieuwe data array waar alleen personenauto wordt weergegeven 
function autos(dataArr, specificValue) {
    //sjors heeft mij geholpen met deze regel
    return dataArr.filter((item) => item["voertuigsoort"] == specificValue)
}

//transformeer data, laurens code: https://vizhub.com/Razpudding/c2a9c9b4fde84816931c404951c79873?edit=files&file=index.js
function transformData(dataArr) {
    const leanData = dataArr.map(item => {
        return {
            kleur: item.eerste_kleur,
            merk: item.merk
        }
    })
    //data filteren naar kleur en merk
    console.log("data transformeren part 1", leanData)
    return leanData
}

// Geeft alle waardes van een specifieke kolom van de data in een array
function filterData(dataArr, column) {
    // door alle data heen gaan en alleen de geselecteerde kolom geven
    return dataArr.map(item => item[column])
}

// unieke waardes van een kolom returnen in een array
function countUnique(dataArr) {
    let uniqueArray = [];

    for (var i = 0; i < dataArr.length; i++) {
        //https://stackoverflow.com/questions/15052702/count-unique-elements-in-array-without-sorting/15052738#15052738
        uniqueArray[dataArr[i]] = 1 + (uniqueArray[dataArr[i]] || 0)
    }
    return uniqueArray
}

//https://stackoverflow.com/questions/36411566/how-to-transpose-a-javascript-object-into-a-key-value-array
function newArray(dataArr) {
    return Object.entries(dataArr).map(([key, value]) => ({
        key,
        value
    }));
}




function setupInput() {
    const input = d3.select('#filter')
        .on("click", update)
    // console.log("this is clicked", input)
}

function update() {
    //check of filter aan staat
    const filterOn = this ? this.checked : false
    console.log(filterOn)

    //geef de data terug die is geselecteerd
    const dataSelection = filterOn ? allBrands.filter(brand => brand.key) : allColors
    console.log(dataSelection)

    //update x domain
    xscale.domain(allBrands.map(brand => brand.key)).padding(0.5)
    // console.log(xscale.domain())

    //update y domain
    yscale.domain([0, d3.max(allColors, yValue)])
    // console.log(yscale.domain())

    //bars maken
    const bars = g.selectAll('rect')
        .data(dataSelection)

    //update
    bars
        .attr('x', d => xscale(xValue(d))) // berekend de x attributes
        .attr('y', d => yscale(yValue(d))) // berekend de y attributes
        .attr('width', xscale.bandwidth())
        .attr('height', d => innerHeight - yscale(yValue(d)))


    //maakt bars voor elke rij
    bars.enter()
        .append('rect')
        .attr('x', d => xscale(xValue(d))) // berekend de x attributes
        .attr('y', d => yscale(yValue(d))) // berekend de y attributes
        .attr('width', xscale.bandwidth())
        .attr('height', d => innerHeight - yscale(yValue(d)))


    bars.exit()
        .remove()


    //update y as
    g.select('axis-y')
        .call(d3.axisLeft(yscale)
            .ticks(10));


    // update x as
    g.select('axis-x').call(d3.axisBottom(xscale))
        .selectAll("text")
        .attr("transform", "rotate(90)")
        .attr("dx", "55")
        .attr("dy", "-1em");
}