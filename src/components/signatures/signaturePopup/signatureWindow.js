import { range } from "d3-array";
import { axisBottom, axisTop } from "d3-axis";
import { scaleLinear } from "d3-scale";
import { select } from "d3-selection";
import { lowerCase } from "lodash";

const w = 900;
const h = 600;
const unitWidth = 15;
const unitHeight = unitWidth;
const unitBuffer = 5;
const unitWidthTotal = unitWidth + unitBuffer;
const fontDisplayColor = "#000000";
const selectedColor = "#FFF200";
const selectedColorMutant = "#ED7014";

export const displaySignatureWindow = () => {

    const dualScreenLeft = window.screenLeft !==  undefined ? window.screenLeft : window.screenX;
    const dualScreenTop = window.screenTop !==  undefined   ? window.screenTop  : window.screenY;
  
    const width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
    const height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;
  
    const systemZoom = width / window.screen.availWidth;
    const left = (width - w) / 2 / systemZoom + dualScreenLeft;
    const top = (height - h) / 2 / systemZoom + dualScreenTop;
  
    const signatureWindow = window.open("", "_blank", 
      `
        scrollbars=no,
        width=${w / systemZoom}, 
        height=${h / systemZoom}, 
        top=${top}, 
        left=${left},
        titlebar=no,
        toolbar=no,
        menubar=yes
      `
    );

    if (window.focus) signatureWindow.focus();


    return signatureWindow;
}


export const generateSignatureWindowContent = (groupCategory, group, position) => {

    let html = "<html>";

    // HEAD

    html += "<head>";
    html += "<title>SIGNATURE SELECTOR</title>";
    html += getSignatureWindowStyle();
    html += "</head>";

    // BODY

    html += "<body>";

    html += "<div class=\"wrapper\">";

    html += getHeaderDiv(groupCategory, group, position);

    html += "<div id=\"selection\" class=\"scrollPane\"></div>";

    html += "<div id=\"results\" class=\"results\"></div>";

    html += getFooterDiv();

    html += "</div>";

    html += "</body>";

    html += "</html>";

    return html;
}


export const populateSignatureSequence = (signatureWindow, sequence, position) => {

    // Include up to 500 bases to the 5' and 3' of the selected position in the display:
    const flankingSequenceLength = 500;
    let start = 0;
    let stop = sequence.length - 1;
    if((position - flankingSequenceLength) > 0) {
        start = position - flankingSequenceLength;
    }
    if((position + flankingSequenceLength) < (sequence.length - 1)) {
        stop = position + flankingSequenceLength;
    }

    const svgWidth = (stop - start + 2) * unitWidthTotal;

    var selectionContent = signatureWindow.document.getElementById('selection');
    var resultsContent = signatureWindow.document.getElementById('results');

    var svg = select(selectionContent)
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", "100%");

    var resultsSvg = select(resultsContent)
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%");
    
    // Draw the X-axis (absolute sequence positions):
    let startX = unitWidthTotal;
    let endX = svgWidth - unitWidthTotal;
    let xDomain = [start, stop];
    let tickStart = Math.ceil(start / 10) * 10;
    let tickStop = Math.floor(stop / 10) * 10;
    var xScale = scaleLinear()
        .domain(xDomain)
        .range([startX, endX]);
    var xAxis = axisTop(xScale)
        .tickValues(range(tickStart, tickStop + 1, 10))
        .tickSize(6); // Specify the length of ticks
    var xAxisGroup = svg.append("g")
        .attr("class", "x-axis")
        //.attr("transform", "translate(0," + h / 12 + ")") // Adjust y position if needed
        .attr("transform", "translate(0, 50)")
        .call(xAxis);
    xAxisGroup.selectAll(".tick line")
        .style("stroke", "black"); // Adjust tick color
    xAxisGroup.selectAll(".tick text")
        .style("font-size", "10px") // Adjust font size
        .style("fill", "black"); // Adjust text color


    // Draw the X-axis (sequence positions relative to selected position):
    var xScaleRelative = scaleLinear()
        .domain([-flankingSequenceLength, flankingSequenceLength]) // Range of relative positions
        .range([startX, endX]); // Same range as the absolute scale
    var xAxisRelative = axisBottom(xScaleRelative)
        .tickValues(range(-flankingSequenceLength, flankingSequenceLength + 1, 10)) // this might be problematic if the position chosen is less than flankingSequenceLength from either end.
        .tickSize(6); // Specify the length of ticks
    var xAxisGroupRelative = svg.append("g")
        .attr("class", "x-axis")
        //.attr("transform", "translate(0," + (h / 4) + ")") // Adjust y position if needed
        .attr("transform", "translate(0, 110)")
        .call(xAxisRelative);
    xAxisGroupRelative.selectAll(".tick line")
        .style("stroke", "black"); // Adjust tick color
    xAxisGroupRelative.selectAll(".tick text")
        .style("font-size", "10px") // Adjust font size
        .style("fill", "black"); // Adjust text color

    let selectedBases = [];
    drawSelectSequence(sequence, start, stop, selectedBases, svg, resultsSvg);

    let midpoint = (svgWidth / 2) - (w * 3 / 4)

    setTimeout(() => {
        selectionContent.scrollLeft = midpoint;
    }, 100);
}


function drawSelectSequence(sequence, start, stop, selectedBases, svg, resultsSvg) {

    // Draw the sequence:
    let displayIndex = 0;
    let baseRect = [];

    for (let i = start; i <= stop; i++) {
    
        baseRect[i] = svg.append("rect")
            .attr("x", (unitWidthTotal * (displayIndex + 1)) - 7)
            .attr("y", 80 - (unitHeight / 2))
            .attr("width", unitWidth)
            .attr("height", unitHeight)
            .attr("fill", sequence[i].getDisplayColor());

        let base = svg.append("text")
            .attr("x", (unitWidthTotal * (displayIndex + 1)) - 4)
            .attr("y", 80)
            .style("fill", fontDisplayColor)
            .attr("dy", ".4em")
            .attr("font-size", "12px")
            .attr("text-align", "center")
            .text(sequence[i].getDisplayBase())
            .style("cursor", "pointer")
            .on("click", function() {
                // Clear previous selections if we already have two selected bases at this point; we're starting over now.
                if(selectedBases.length == 2) {
                    for(let m = selectedBases[0]; m <= selectedBases[1]; m++) {
                        baseRect[m].attr("fill", sequence[m].getDisplayColor());
                    }
                    selectedBases = [];
                }
                // If the selection is not part of selectedBases push it to selectedBases and change its color to selected.
                if(!selectedBases.includes(i)) {
                    selectedBases.push(i);
                    if(sequence[i].containsMutations()) {
                        baseRect[i].attr("fill", selectedColorMutant);
                    }
                    else {
                        baseRect[i].attr("fill", selectedColor);
                    }
                }
                // Otherwise, remove it from selectedBases and change its color back to the original display color.
                else {
                    selectedBases = selectedBases.filter(selectedBase => selectedBase !== i);
                    baseRect[i].attr("fill", sequence[i].getDisplayColor());
                }
                // At this point, if there are two elements in selectedBases, change their colors and those of all in between to selected.
                // Then, display the results in the resultsSvg.
                if(selectedBases.length == 2) {
                    selectedBases = selectedBases.sort(function(a, b) {
                        return a - b;
                    });
                    for(let n = selectedBases[0]; n <= selectedBases[1]; n++) {
                        if(sequence[n].containsMutations()) {
                            baseRect[n].attr("fill", selectedColorMutant);
                        }
                        else {
                            baseRect[n].attr("fill", selectedColor);
                        }
                    }
                    displayResults(resultsSvg, sequence, selectedBases);
                }
                // Otherwise, clear the resultsSvg.
                else {
                    removeResults(resultsSvg);
                }
            })
            .append("title")
            .text(function() {
                return i;
            });

        displayIndex++;
    }
}


function displayResults(resultsSvg, sequence, selectedBases) {

    removeResults(resultsSvg);

    let seqString = "";

    for(let i = selectedBases[0]; i <= selectedBases[1]; i++) {
        seqString += getDisplayCase(sequence[i]);
    }

    resultsSvg.append("text")
        .attr("x", 100)
        .attr("y", 10)
        .style("fill", fontDisplayColor)
        .attr("dy", "1em")
        .attr("font-size", "20px")
        .attr("text-align", "center")    
        .text(seqString);

    resultsSvg.append("text")
        .attr("x", 100)
        .attr("y", 50)
        .style("fill", fontDisplayColor)
        .attr("dy", "1em")
        .attr("font-size", "20px")
        .attr("text-align", "center")    
        .text("Start Position: " + selectedBases[0]);

    resultsSvg.append("text")
        .attr("x", 100)
        .attr("y", 75)
        .style("fill", fontDisplayColor)
        .attr("dy", "1em")
        .attr("font-size", "20px")
        .attr("text-align", "center")    
        .text("Stop Position: " + selectedBases[1]);

    resultsSvg.append("text")
        .attr("x", 100)
        .attr("y", 100)
        .style("fill", fontDisplayColor)
        .attr("dy", "1em")
        .attr("font-size", "20px")
        .attr("text-align", "center")    
        .text("Length: " + seqString.length);

    resultsSvg.append("text")
        .attr("x", 100)
        .attr("y", 125)
        .style("fill", fontDisplayColor)
        .attr("dy", "1em")
        .attr("font-size", "20px")
        .attr("text-align", "center")    
        .text("Tm: " + getTm(seqString) + "°");

    resultsSvg.append("text")
        .attr("x", 100)
        .attr("y", 150)
        .style("fill", fontDisplayColor)
        .attr("dy", "1em")
        .attr("font-size", "20px")
        .attr("text-align", "center")    
        .text("GC: " + getGCPercent(seqString) + "%");
}


// If there are no mutations at this allele return this in lower case designation.
function getDisplayCase(base) {

    if(!base.containsMutations()) {
        return base.getDisplayBase().toLowerCase();
    }

    return base.getDisplayBase();
}


function removeResults(resultsSvg) { 

    resultsSvg.selectAll("*").remove();
}


function getHeaderDiv(groupCategory, group, position) {

    let header = "<div class=\"header\">";
    header += "<img src=\"../../../dist/1730310c32752e095ee7.svg\"/>";
    header += "<h1>Signature Selector</h1><br/>";
    header += "<ul>";
    header += "<li>Group Category: <span class=\"dataText\">" + groupCategory.charAt(0).toUpperCase() + groupCategory.slice(1) + "</span></li>";
    header += "<li>Sequence Group: <span class=\"dataText\">" + group.replace(/-/g, ' ') + "</span></li>";
    header += "<li>Selected Position: <span class=\"dataText\">" + position + "</span></li>";
    header += "</ul>"
    header += "</div>";

    return header;
}


function getFooterDiv() {

    let footer = "<div class=\"footer\">";
    footer += "<a href=\"https://www.radxrad.org\">RADx Radical DCC 2024</a>";
    footer += "</div>";

    return footer;
}


function getTm(sequence) {

    const a = (sequence.toUpperCase().match(/A/g) || []).length;
    const c = (sequence.toUpperCase().match(/C/g) || []).length;
    const g = (sequence.toUpperCase().match(/G/g) || []).length;
    const t = (sequence.toUpperCase().match(/T/g) || []).length;

    const at = a + t;
    const cg = c + g;

    // https://www.rosalind.bio/en/knowledge/what-formula-is-used-to-calculate-tm
    
    return Math.round(64.9 + (41 * (cg - 16.4) / (at + cg)));
}


function getGCPercent(sequence) {

    const c = (sequence.toUpperCase().match(/C/g) || []).length;
    const g = (sequence.toUpperCase().match(/G/g) || []).length;

    return Math.round(100 * (c + g) / sequence.length);
}

function getSignatureWindowStyle() {

    let style = "<style>";

    style += `
        html {
            font-family: "Lato", "Helvetica Neue", "Helvetica", "sans-serif";
            font-size: 14px;
            color: var(--medGrey);
            backgroundColor: "#FFF";
        }
        body {
            margin: 0;
            padding: 0;
        }
        h2 {
            font-family: Lato, &quot;Helvetica Neue&quot;, Helvetica, sans-serif;
            font-size: 28px;
            margin-left: 0px;
            margin-top: 15px;
            margin-bottom: 15px;
            font-weight: 350;
            color: rgb(51, 51, 51);
            letter-spacing: -0.5px;
            line-height: 1.2;
        }
        h4 {
            font-family: Lato, &quot;Helvetica Neue&quot;, Helvetica, sans-serif;
            font-size: 16px;
            margin-left: 0px;
            margin-top: 10px;
            margin-bottom: 10px;
            font-weight: 350;
            color: rgb(51, 51, 51);
            letter-spacing: -0.5px;
            line-height: 1.2;
        }
        h5 {
            font-family: Lato, &quot;Helvetica Neue&quot;, Helvetica, sans-serif;
            font-size: 14px;
            margin-left: 0px;
            margin-top: 5px;
            margin-bottom: 5px;
            font-weight: 350;
            color: rgb(51, 51, 51);
            letter-spacing: -0.5px;
            line-height: 1.0;
        }
        .results {
            width: 100%;
            height: 40%;
            margin: 0 auto; /* Center the results div horizontally */
            font-family: Lato, &quot;Helvetica Neue&quot;, Helvetica, sans-serif;
            font-size: 20px;
            letter-spacing: 0.4rem;
            margin-left: 5px;
            margin-top: 5px;
            margin-bottom: 5px;
            font-weight: 350;
            style="overflow-wrap: break-word;"
            flex: 1;
        }
        .scrollPane {
            width: 100%;
            height: 60%;
            flex: 1;
            overflow-x: scroll;
            overflow-y: hidden;
            scrollbar-base-color: "pink";
        }
        .header {
            margin-top: 0;
            font-family: Lato, &quot;Helvetica Neue&quot;, Helvetica, sans-serif;
            vertical-align: middle;
            background: #30353F;
            padding: 0px;
            width: 100%;
            height: 250px;
        }
        .header img {
            float: left;
            margin: 25px 15px 15px 25px;
            width: 50px;
            height: 50px;
        }
        .header h1 {
            text-align: center;
            line-height: 20px;
            color: #D3D3D3;
            font-size: 38px;
            margin-left: 0px;
            margin-top: 40px;
            margin-bottom: 15px;
            font-weight: 350;
            letter-spacing: 1.5rem;
        }
        .header h2 {
            text-align: center;
            font-size: 28px;
            margin-left: 0px;
            margin-top: 15px;
            margin-bottom: 15px;
            font-weight: 350;
            color: #D3D3D3;
            letter-spacing: 1.5rem;
        }
        .header ul {
            font-size: 20px;
            margin: 50px 20px;
            width: 25%;
            text-align: left;
            color: #D3D3D3;
            list-style-type: none;
        } 
        .footer {
            margin-top: 0;
            text-align: center;
            vertical-align: middle;
            background: #30353F;
            padding: 0px;
            width: 100%;
            height: 50px;
            line-height: 50px;
            text-decoration: none;
            color: #D3D3D3;
            font-size: 14px;
            font-weight: 400;
            position: relative;
            margin-top: -50px;
        }
        .footer a:link {
            text-decoration: none;
            color: #D3D3D3;
        }
        .footer a:visited {
            text-decoration: none;
            color: #D3D3D3;
        }
        .wrapper {
            display: flex;
            flex-direction: column;
            height: 100%;
        }
    `;

    style += "</style>";

    return style;
}
