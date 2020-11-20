//Endpoint geeft de dataset GEKENTEKENDE VOERTUIGEN: https://opendata.rdw.nl/Voertuigen/Open-Data-RDW-Gekentekende_voertuigen/m9d7-ebf2
//data selecteren die ik gebruik
const endpoint = 'https://opendata.rdw.nl/resource/m9d7-ebf2.json'
const colorColumn = 'kleur'
const brandColumn = 'merk'

//array's voor de barchart
let allColors
let allBrands

//settings voor de barchart
const chartContainer = d3.select('#chart-container');
const width = 800;
const height = 650;
const margin = {
    top: 50,
    right: 40,
    bottom: 200,
    left: 75
};
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

//x en de y schalen
let xScale = d3.scaleBand().padding(0.5); //scaleBand is voor de bars
let yScale = d3.scaleLinear()

//x-as en y-as keys en values meegegeven
const xValue = d => d.key;
const yValue = d => d.value;

const render = data => {
    //svg maken in chartContainer
    const svg = chartContainer
        .append('svg')
        .attr('width', width)
        .attr('height', height)

    //groep maken in svg
    let g = svg
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`)

    //opzetten van x schaal
    xScale.domain(data.map(xValue)) //loop door xValue voor de keys
    xScale.range([0, innerWidth]) //breedte van de x-as

    //opzetten van y schaal
    yScale.domain([0, d3.max(data, yValue)]) //minimum en maximum voor de domain
    yScale.range([innerHeight, 0]) //hoogte van de y-as

    //opzetten van x as
    g.append('g')
        .attr("class", "axis-x")
        .call(d3.axisBottom(xScale))
        .attr('transform', `translate(0, ${innerHeight})`)

    // x as text omdraaien
    //https://vizhub.com/Razpudding/c2a9c9b4fde84816931c404951c79873?edit=files&file=index.js
    g.selectAll(".ticks, text")
        .attr("text-anchor", "start")
        .attr("transform", "rotate(90)")
        .attr("dx", 20)
        .attr("dy", "-0.5em")
    
    // text label van x as
    //https://www.youtube.com/watch?v=c3MCROTNN8g&t=419s
    g.append("text")
        .attr("transform", `translate(0, ${innerHeight})`)
        .attr("y", "100")
        .attr("x", "312")
        .text("KENMERK");

    //opzetten van y as
    g.append('g')
        .attr("class", "axis-y")
        .call(d3.axisLeft(yScale)
            .ticks(10));



    //text label voor de y as
    g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y","-50")
        .attr("x", "-220")
        // .style("text-anchor", "middle")
        .text("AANTAL");


    //bars maken
    g.selectAll('rect')
        .data(data)
        .enter() //maakt bars voor elke rij
        .append('rect')
        .attr('x', d => xScale(xValue(d))) //berekend de x attributes
        .attr('y', d => yScale(yValue(d))) //berekend de y attributes
        .attr('width', xScale.bandwidth()) //geeft de breedte mee van een bar
        .attr('height', d => innerHeight - yScale(yValue(d))) //geeft de hoogte mee van een bar

}

//data ophalen van endpoint
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

    render(allColors) //render de kleuren array in de barchart
    setupInput() //check of de input is geselecteerd
})

//Geeft een nieuwe data array waar alleen personenauto wordt weergegeven
function autos(dataArr, specificValue) {
    //sjors heeft mij geholpen met deze regel
    //filter door voertuigsoort heen en check of de waarde klopt
    return dataArr.filter((item) => item["voertuigsoort"] == specificValue)
}

//transformeer data, laurens code: https://vizhub.com/Razpudding/c2a9c9b4fde84816931c404951c79873?edit=files&file=index.js
function transformData(dataArr) {
    const leanData = dataArr.map(item => {
        return {
            kleur: item.eerste_kleur.toLowerCase(),
            merk: item.merk.toLowerCase()
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
    //array maken met per item een object
    return Object.entries(dataArr).map(([key, value]) => ({
        key,
        value
    }));
}

function setupInput() {
    const input = d3.select('#filter') //input field selecteren
        .on("click", update) //klik functie geven
}

function update() {
    //check of filter aan staat
    const filterOn = this ? this.checked : false

    //geef de data terug die is geselecteerd
    const dataSelection = filterOn ? allBrands : allColors

    //schoonbroer heeft mij hierbij geholpen
    chartContainer.select('svg').remove(); //door de chart helemaal te verwijderen 
    render(dataSelection) //herbruik ik de functie render, om een nieuwe barchart te maken

}