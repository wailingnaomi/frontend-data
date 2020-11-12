// Endpoint geeft de dataset GEKENTEKENDE VOERTUIGEN: https://opendata.rdw.nl/Voertuigen/Open-Data-RDW-Gekentekende_voertuigen/m9d7-ebf2

const endpoint = 'https://opendata.rdw.nl/resource/m9d7-ebf2.json'
const colorColumn = 'kleur'
const brandColumn = 'merk'


const svg = d3.select('svg');

const width = +svg.attr('width');
const height = +svg.attr('height');


const render = data => {
    const xValue = d => d.key;
    const yValue = d => d.value;
    const margin = {top: 100, right: 40, bottom: 20, left: 100};
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const xscale = d3.scaleBand()
    // loop door yValue voor de landnamen
    .domain(data.map(xValue))
        //breedte van de x-as
        .range([0, innerWidth])
        .padding(0.1);
        
    
    //bandScale is voor de bars
    const yscale = d3.scaleLinear()
        //minimum en maximum voor de domain
        .domain([0, d3.max(data, yValue)])
        //hoogte van de y-as
        .range([innerHeight, 0])
       

    const xAxis = d3.axisBottom(xscale);

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
            .attr('x', d => xscale(xValue(d))) // berekend de x attributes
            .attr('y', d => yscale(yValue(d))) // berekend de y attributes
            .attr('height', d => innerHeight - yscale(yValue(d))) 
                .attr('width', xscale.bandwidth())
}

d3.json(endpoint).then(data => {

    const specifiekeAuto = autos(data, "Personenauto")
    console.log("data van alleen personenauto", specifiekeAuto)

    const transform = transformData(specifiekeAuto)

    // data ophalen van een geselecteerde kolom
    const colorColumnArray = filterData(transform, colorColumn)
    // console.log("alle data van kleuren", colorColumnArray)

    const brandColumnArray = filterData(transform, brandColumn)
    // console.log("alle data van merken", brandColumnArray)

    //laat zien hoeveel van elke unieke waarde er is
    const amountColors = countUnique(colorColumnArray)
    console.log("tel de kleuren", amountColors)

    const amountBrands = countUnique(brandColumnArray)
    console.log("tel de merken", amountBrands)

    const allColors = newArray(amountColors)
    console.log("alle kleuren in nieuwe array", allColors)

    const allBrands = newArray(amountBrands)
    console.log("alle merken in nieuwe array", allBrands)

    // console.log(data)
    render(allColors)
})

//Geeft een nieuwe data array waar alleen personenauto wordt weergegeven 
function autos(dataArr, specificValue){
    //sjors heeft mij geholpen
    return dataArr.filter((item) => item["voertuigsoort"] == specificValue)
}

//transformeer data, laurens code
function transformData(dataArr){
    const leanData = dataArr.map(item =>{
        return{
            kleur: item.eerste_kleur,
            merk: item.merk
        }
    })
    console.log("dit is filteren", leanData)
    return leanData
}

// Geeft alles waardes van een specifieke kolom van de data in een array
function filterData(dataArr, column) {
    // door alle data heen gaan en alleen de geselecteerde kolom geven
    return dataArr.map(item => item[column])
}

// unieke waardes van een kolom returnen in een array

function countUnique(dataArr) {
    // zoek de unieke waarde
    let uniqueArray = [];

    for(var i = 0; i < dataArr.length; i++){
        //https://stackoverflow.com/questions/15052702/count-unique-elements-in-array-without-sorting/15052738#15052738
        uniqueArray[dataArr[i]] = 1 + (uniqueArray[dataArr[i]] || 0)
    }
    return uniqueArray
}

//https://stackoverflow.com/questions/36411566/how-to-transpose-a-javascript-object-into-a-key-value-array
function newArray(dataArr){
    return Object.entries(dataArr).map(([key, value])=>({key,value}));
}






