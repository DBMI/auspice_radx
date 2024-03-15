import { range } from "d3-array";
import { axisBottom, axisTop } from "d3-axis";
import { scaleLinear } from "d3-scale";
import { select } from "d3-selection";

const w = 800;
const h = 300;

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
        scrollbars=yes,
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


export const generateSignatureWindowContent = (group, position) => {

    let html = "<html>";

    // HEAD

    html += "<head>";
    html += "<title>SIGNATURE SELECTOR</title>";
    html += getSignatureWindowStyle();
    html += "</head>";

    // BODY

    html += "<body>";

    html += "<div class=\"wrapper\">";

    html += getHeaderDiv(group, position);

    html += "<div id=\"content\" class=\"scrollPane\"></div>";

    html += getFooterDiv();

    html += "</div>";

    html += "</body>";

    html += "</html>";

    return html;
}


export const populateSignatureSequence = (signatureWindow, sequence, position) => {

    const unitWidth = 15;
    const unitHeight = unitWidth;
    const unitBuffer = 5;
    const unitWidthTotal = unitWidth + unitBuffer;
    
    const fontDisplayColor = "#000000";

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

    var content = signatureWindow.document.getElementById('content');

    var svg = select(content)
        .append("svg")
        .attr("width", svgWidth)
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
        .attr("transform", "translate(0," + h / 8 + ")") // Adjust y position if needed
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
        .attr("transform", "translate(0," + (h / 2) + ")") // Adjust y position if needed
        .call(xAxisRelative);
    xAxisGroupRelative.selectAll(".tick line")
        .style("stroke", "black"); // Adjust tick color
    xAxisGroupRelative.selectAll(".tick text")
        .style("font-size", "10px") // Adjust font size
        .style("fill", "black"); // Adjust text color


    // Draw the sequence:
    let displayIndex = 0;
    for(let i = start; i <= stop; i++) {

        let currentBase = sequence[i];

        let rect = svg.append("rect")
            .attr("x", (unitWidthTotal * (displayIndex + 1)) - 7)
            .attr("y", 100 - (unitHeight / 2))
            .attr("width", unitWidth)
            .attr("height", unitHeight)
            .attr("fill", sequence[i].getDisplayColor());
      
        svg.append("text")
            .attr("x", (unitWidthTotal * (displayIndex + 1)) - 4)
            .attr("y", 100)
            .style("fill", fontDisplayColor)
            .attr("dy", ".4em")
            .attr("font-size", "12px")
            .attr("text-align", "left")
            .text(sequence[i].getDisplayBase())
            .on("click", function() {
                //alert("Clicked on position " + (displayIndex + 1) + ".")
                if(rect.attr("fill") == sequence[i].getDisplayColor()) {
                    rect.attr("fill", "yellow");
                }
                else {
                    rect.attr("fill", sequence[i].getDisplayColor());
                }
            })
            .append("title")
            .text(function() {
                return i;
            })
            .style("cursor", "pointer");

        displayIndex++;
    }

    content.scrollLeft = (flankingSequenceLength * unitWidthTotal) - (1.25 * w);
}



function getHeaderDiv(group, position) {

    let header = "<div class=\"header\">";
    header += "<img src=\"../../../dist/1730310c32752e095ee7.svg\"/>";
    header += "<h1>Signature Selector</h1>";
    header += "<ul>";
    header += "<li>Sequence Group: <span class=\"dataText\">" + group + "</span></li>";
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
        .scrollPane {
            width: "100%";
            height: 225px;
            overflow-x: scroll;
            overflow-y: hidden;
            scrollbar-base-color: "pink";
        }
        .selectWrapper{
            margin-top: 5px;
            border-radius:5px;
            display:inline-block;
            overflow:hidden;
            background:#cccccc;
            border:1px solid #cccccc;
        }
        .selectBox{
            font-family: Lato, &quot;Helvetica Neue&quot;, Helvetica, sans-serif;
            width: 200px;
            height: 30px;
            border: 0px;
            outline: none;
            font-weight: 350;
            color: rgb(51, 51, 51);
            letter-spacing: -0.5px;
            line-height: 1.2;
            border: 6px solid transparent;
            border-color: #fff transparent transparent transparent;
        }
        .wrapper {
            min-height: 100%;
            display: grid;
            grid-template-rows: auto 1fr auto;
        }
        .header {
            margin-top: 0;
            font-family: Lato, &quot;Helvetica Neue&quot;, Helvetica, sans-serif;
            vertical-align: middle;
            background: #30353F;
            padding: 0px;
            width: 100%;
            height: 225px;
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
            margin: 50px 20px;
            text-align: left;
            color: #D3D3D3;
            list-style-type: none;
        }
        .dataText {
            color: #5DA8A3;
        }
        .messages {
            height: 45px;
        }
        .warningMessages {
            display: none;
            padding: 20px;
            background: #FFC1CC;
            text-align: center;
            vertical-align: middle;
            color: #AE0000;
            font-size: 24px;
            font-weight: 350;
            width: 100%;
            margin-bottom: 20px;
        }
        .primerWindow {
            padding: 0px;
            width: 75%;
            margin: auto;
            background: "#FDDDE6";
            padding-top: 20px;
            padding-bottom: 100px;
        }
        .primers {
            font-family: Lato, &quot;Helvetica Neue&quot;, Helvetica, sans-serif;
            font-size: 16px;
        }
        .primerText {
            font-family: "courier", "courier new", "serif";
            font-size: 16px;
        }
        .primerWindow h2 {
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
        .downloadPrimersButton {
            background-color: #5DA8A3;
            border: none;
            color: white;--#30353F;
            cursor:pointer;
            padding: 15px 32px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            font-size: 16px;
            border-radius: 15px 15px;
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
        .primerPair {
            width: 100%;
            overflow: hidden; /* will contain if #first is longer than #second */
        }
        .primerSelect {
            width: 10%;
            float:left; /* add this */
        }
        .primerSequence {
            width: 60%;
            float:left; /* add this */
        }
        .primerMeta {
            overflow: hidden; /* if you don't want #second to wrap below #first */
        }
    `;

    style += "</style>";

    return style;
}
