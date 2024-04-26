import { range } from "d3-array";
import { axisBottom, axisTop } from "d3-axis";
import { scaleLinear } from "d3-scale";
import { select } from "d3-selection";
import { lowerCase } from "lodash";
import { getAllRestrictionSites, getNonConservedRestrictionSites, getRestrictionSiteLength } from "./helpers/restrictionAnalysis";
import { getBrighterColor } from "../../../util/colorHelpers";
import { retrieveSequence } from "./../signaturesHelpers";
import { getAminoAcidSequence } from "./helpers/dnaToAA";

const w = 900;
const h = 750;
const unitWidth = 15;
const unitHeight = unitWidth;
const unitBuffer = 5;
const unitWidthTotal = unitWidth + unitBuffer;
const fontDisplayColor = "#000000";
const selectedColor = "#FFF200";
const selectedColorMutant = "#ED7014";

let actualWidth = w;    // Reset this when creating the window below.
let actualHeight = h;   // Reset this when creating the window below.


export const displaySignatureWindow = () => {

    const dualScreenLeft = window.screenLeft !==  undefined ? window.screenLeft : window.screenX;
    const dualScreenTop = window.screenTop !==  undefined   ? window.screenTop  : window.screenY;
  
    const width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
    const height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;
    
    const systemZoom = width / window.screen.availWidth;
    const left = (width - w) / 2 / systemZoom + dualScreenLeft;
    const top = (height - h) / 2 / systemZoom + dualScreenTop;
    
    actualWidth = w / systemZoom;
    actualHeight = h / systemZoom;

    const signatureWindow = window.open("", "_blank", 
      `
        scrollbars=no,
        width=${actualWidth}, 
        height=${actualHeight}, 
        top=${top}, 
        left=${left},
        titlebar=no,
        toolbar=no,
        menubar=yes
      `
    );

    signatureWindow.openTab = function(evt, tabName) {
        var i, tabcontent, tablinks;

        // Hide all tab content
        tabcontent = document.getElementsByClassName("tabcontent");
        for (i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
        }

        // Remove the 'active' class from all tab buttons
        tablinks = document.getElementsByClassName("tablinks");
        for (i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(" active", "");
        }

        // Show the specific tab content
        document.getElementById(tabName).style.display = "block";

        // Add the 'active' class to the button that opened the tab
        evt.currentTarget.className += " active";
    }

    if (window.focus) signatureWindow.focus();

    return signatureWindow;
}



export const generateSignatureWindowContent = (groupCategory, group, position, orf) => {

    let html = "<html>";

    // HEAD

    html += "<head>";
    html += "<title>SIGNATURE SELECTOR</title>";
    html += getSignatureWindowStyle();
    html += "</head>";

    // BODY

    html += "<body>";

    html += getHeaderDiv(groupCategory, group, position, orf);

    html += "<div class=\"wrapper\">";

    html += getTabDiv();

    html += "<div id=\"ampliconSelection\" class=\"tabcontent\" style=\"display: block;\">";
    html += "<div id=\"selection\" class=\"horizontalScrollPane\" style=\"width: 100%\"></div>";
    html += "<div id=\"results\" class=\"results\"></div>";
    html += "</div>";

    html += "<div id=\"restrictionComparison\" class=\"tabcontent\" style=\"display: none; height: 100%;\">";
    html += "<div id=\"nonConservedSites\" class=\"verticalScrollPane\" style=\"height: 40%\"></div>";
    html += "<div id=\"restrictionSiteDetails\" style=\"display: none; height: 60%\"></div>";
    html += "</div>";

    html += "<div id=\"aaAlignment\" class=\"tabcontent\" style=\"display: none; height: 100%;\">";
    html += "<div id=\"aaMSALegend\" style=\"width: 80px; flex-shrink: 0;\"></div>";
    html += "<div id=\"aaMSA\" class=\"horizontalScrollPane\" style=\"width: 100%\"></div>";
    html += "</div>";

    html += "</div>";

    html += getFooterDiv();

 

    html += "</body>";

    html += "</html>";

    return html;
}



function initializeTabButtons(signatureWindow) {

    const ampliconSelectionDiv = signatureWindow.document.getElementById("ampliconSelection");
    const restrictionComparisonDiv = signatureWindow.document.getElementById("restrictionComparison");
    const aaAlignmentDiv = signatureWindow.document.getElementById("aaAlignment");

    const ampliconButton = signatureWindow.document.getElementById("ampliconButton");
    const restrictionButton = signatureWindow.document.getElementById("restrictionButton");
    const aaAlignmentButton = signatureWindow.document.getElementById("aaAlignmentButton");

    const selectedBackgroundColor = getBrighterColor(getBrighterColor(getBrighterColor('#30353F')));

    ampliconButton.style.background = selectedBackgroundColor;
    ampliconButton.style.fontDisplayColor = '##5da8a3';

    restrictionButton.style.background = '#D3D3D3';
    ampliconButton.style.fontDisplayColor = '#30353F';

    aaAlignmentButton.style.background = '#D3D3D3';
    aaAlignmentButton.style.fontDisplayColor = '#30353F';

    ampliconButton.addEventListener("click", function() { 

        restrictionComparisonDiv.style.display = "none";
        ampliconSelectionDiv.style.display = "block";
        aaAlignmentDiv.style.display = "none";

        ampliconButton.style.background = selectedBackgroundColor;
        ampliconButton.style.fontDisplayColor = '##5da8a3';

        restrictionButton.style.background = '#D3D3D3';
        restrictionButton.style.fontDisplayColor = '#30353F';

        aaAlignmentButton.style.background = '#D3D3D3';
        aaAlignmentButton.style.fontDisplayColor = '#30353F';
    });

    restrictionButton.addEventListener("click", function() { 

        ampliconSelectionDiv.style.display = "none";
        restrictionComparisonDiv.style.display = "block";
        aaAlignmentDiv.style.display = "none";

        ampliconButton.style.background = '#D3D3D3';
        ampliconButton.style.fontDisplayColor = '#30353F';

        restrictionButton.style.background = selectedBackgroundColor;
        restrictionButton.style.fontDisplayColor = '##5da8a3';

        aaAlignmentButton.style.background = '#D3D3D3';
        aaAlignmentButton.style.fontDisplayColor = '#30353F';
    });

    aaAlignmentButton.addEventListener("click", function() {

        ampliconSelectionDiv.style.display = "none";
        restrictionComparisonDiv.style.display = "none";
        aaAlignmentDiv.style.display = "flex";

        ampliconButton.style.background = '#D3D3D3';
        ampliconButton.style.fontDisplayColor = '#30353F';

        restrictionButton.style.background = '#D3D3D3';
        restrictionButton.style.fontDisplayColor = '#30353F';

        aaAlignmentButton.style.background = selectedBackgroundColor;
        aaAlignmentButton.style.fontDisplayColor = '##5da8a3';
    });
}


export const populateSignatureSequence = (signatureWindow, sequence, position) => {

    initializeTabButtons(signatureWindow);

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
        .attr("transform", "translate(0, 40)")
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
        .attr("transform", "translate(0, 100)")
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
        console.log("SVG WIDTH DNA", svgWidth);
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
            .attr("y", 70 - (unitHeight / 2))
            .attr("width", unitWidth)
            .attr("height", unitHeight)
            .attr("fill", sequence[i].getDisplayColor());

        let base = svg.append("text")
            .attr("x", (unitWidthTotal * (displayIndex + 1)) - 4)
            .attr("y", 70)
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
        .attr("y", 0)
        .style("fill", fontDisplayColor)
        .attr("dy", "1em")
        .attr("font-size", "20px")
        .attr("text-align", "center")    
        .text(seqString);

    resultsSvg.append("text")
        .attr("x", 100)
        .attr("y", 40)
        .style("fill", fontDisplayColor)
        .attr("dy", "1em")
        .attr("font-size", "20px")
        .attr("text-align", "center")    
        .text("Start Position: " + selectedBases[0]);

    resultsSvg.append("text")
        .attr("x", 100)
        .attr("y", 65)
        .style("fill", fontDisplayColor)
        .attr("dy", "1em")
        .attr("font-size", "20px")
        .attr("text-align", "center")    
        .text("Stop Position: " + selectedBases[1]);

    resultsSvg.append("text")
        .attr("x", 100)
        .attr("y", 90)
        .style("fill", fontDisplayColor)
        .attr("dy", "1em")
        .attr("font-size", "20px")
        .attr("text-align", "center")    
        .text("Length: " + seqString.length);

    resultsSvg.append("text")
        .attr("x", 500)
        .attr("y", 40)
        .style("fill", fontDisplayColor)
        .attr("dy", "1em")
        .attr("font-size", "20px")
        .attr("text-align", "center")    
        .text("Tm: " + getTm(seqString) + "°");

    resultsSvg.append("text")
        .attr("x", 500)
        .attr("y", 65)
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



export const populateRestrictionMap = (signatureWindow, currentGroup, groups, mutationsMap, rootSequence, genomeAnnotations) => {

    const elementHeight = 20;
    const nonConservedRestrictionSites = getNonConservedRestrictionSites(rootSequence, groups, mutationsMap);
    const restrictionWindowDisplayWidth = actualWidth - 100;
    //const restrictionWindowDisplayHeight = 100 + (groups.length * 25);

    var nonConservedSitesContent = signatureWindow.document.getElementById('nonConservedSites');
    var restrictionSiteDetailsContent = signatureWindow.document.getElementById('restrictionSiteDetails');

    restrictionSiteDetailsContent.style.display = "block";

    var svgNonConserved = select(nonConservedSitesContent)
        .append("svg")
        .style("background-color", "#f0f0f0")
        .attr("width", "100%")
        .attr("height", "100%");

    var svgRestrictionSiteDetails = select(restrictionSiteDetailsContent)
        .append("svg")
        .style("background-color", "#f0f0f0")
        .attr("width", "100%")
        .attr("height", "100%");

    // Draw the blocks representing the ORFs for the different potein coding regions:
    genomeAnnotations.forEach((orf) => {
        
        const orfProtein = orf['prot'];
        const orfDirection = orf['strand'];
        const orfStart = orf['start'];
        const orfEnd = orf['end'];
        const orfColor = orf['fill'];

        var orfX = (orfStart / rootSequence.length) * (restrictionWindowDisplayWidth - 100);
        var orfWidth = ((orfEnd / rootSequence.length) * (restrictionWindowDisplayWidth - 100)) - orfX;

        svgNonConserved.append("rect")
            .attr("x", 100 + orfX)
            .attr("y", 30)
            .attr("width", orfWidth)
            .attr("height", elementHeight)
            .attr("fill", orfColor)
            .style("cursor", "pointer")
            .on("mouseover", function () {
                tooltip.text(orfProtein + ' (' + orfDirection + ')');
            })
            .on("mouseout", function () {
                tooltip.text("");
            });

        var tooltip = svgNonConserved.append("text")
            .attr("x", 100 + orfX + (orfWidth / 2))
            .attr("y", 25)
            .attr("text-anchor", "middle")
            .style("fill", "black")
            .style("font-size", "12px")
            .style("pointer-events", "none");
    });

    let y = 125;
    groups.forEach((group) => {
        let groupKey = group[0];
        let groupColor = group[1];
        if(groupKey == currentGroup) {
            drawGroupRestrictionMap(svgNonConserved, restrictionWindowDisplayWidth, rootSequence, nonConservedRestrictionSites[groupKey], 75, currentGroup, groupColor, svgRestrictionSiteDetails, groups, signatureWindow, genomeAnnotations, mutationsMap);
        }
        else {
            drawGroupRestrictionMap(svgNonConserved, restrictionWindowDisplayWidth, rootSequence, nonConservedRestrictionSites[groupKey], y, groupKey, groupColor, svgRestrictionSiteDetails, groups, signatureWindow, genomeAnnotations, mutationsMap);
            y += 25;
        }; 
    });
}



function drawGroupRestrictionMap(svg, restrictionWindowDisplayWidth, rootSequence, groupNonConservedRestrictionSites, y, groupKey, groupColor, svgRestrictionSiteDetails, groups, signatureWindow, genomeAnnotations, mutationsMap) {
    
    // Define dimensions
    const elementHeight = 20;
    const elementWidth = elementHeight;
    const tickWidth = 3;
    const elementSpace = elementHeight + 5;
    const sequenceLength = rootSequence.length;

    const groupDNASequence = retrieveSequence(rootSequence, mutationsMap.get(groupKey));

    // Draw group definition square
    svg.append("rect")
        .attr("x", 20)
        .attr("y", y)
        .attr("width", elementWidth)
        .attr("height", elementHeight)
        .attr("stroke-width", 2)
        .attr("stroke", groupColor)
        .attr("fill", getBrighterColor(groupColor))
        .on("mouseover", function() {
            groupTooltip.text(groupKey);
        })
        .on("mouseout", function() {
            groupTooltip.text("");
        });

    var groupTooltip = svg.append("text")
        .attr("x", 20)
        .attr("y", 65)
        .style("fill", "black")
        .style("font-size", "12px")
        .style("pointer-events", "none");

    
    for(const restrictionSiteKey in groupNonConservedRestrictionSites) {

        const restrictionSites = groupNonConservedRestrictionSites[restrictionSiteKey];

        restrictionSites.forEach((position) => {

            svg.append("rect")
                .attr("x", 100 + (position / sequenceLength) * (restrictionWindowDisplayWidth - 100))
                .attr("y", y)
                .attr("width", tickWidth)
                .attr("height", elementHeight)
                .attr("fill", groupColor)
                .style("cursor", "pointer")
                .on("mouseover", function () {
                    tooltip.text(restrictionSiteKey + " (" + position + ")");
                })
                .on("mouseout", function () {
                    tooltip.text("");
                })
                .on("click", function() {
                    //restrictionSiteDetailsContent.style.display = "block";
                    drawRestrictionSiteDetails(svgRestrictionSiteDetails, groupDNASequence.slice(position, position + getRestrictionSiteLength(restrictionSiteKey)));
                    //console.log(restrictionSiteKey + ' ' + getRestrictionSiteLength(restrictionSiteKey), groupDNASequence.slice(position, position + getRestrictionSiteLength(restrictionSiteKey)));
                    //const singleEnzymeSitesHeader = restrictionSiteDetailsContent.querySelector("#singleEnzymeSitesHeader");
                    //singleEnzymeSitesHeader.innerHTML = "Single Enzyme Restriction Sites For " + restrictionSiteKey;
                    //drawSingleRestrictionSiteForAllGroups(signatureWindow, restrictionSiteKey, groupKey, groups, restrictionWindowDisplayWidth, rootSequence);
            });

            var tooltip = svg.append("text")
                .attr("x", 100 + (position / sequenceLength) * (restrictionWindowDisplayWidth - 100))
                .attr("y", 65)
                .attr("text-anchor", "middle")
                .style("fill", "black")
                .style("font-size", "12px")
                .style("pointer-events", "none");
        });
    }
}



function drawRestrictionSiteDetails(svgRestrictionSiteDetails, restrictionSequence) {

    svgRestrictionSiteDetails.selectAll("*").remove();

    for(let i = 0; i < restrictionSequence.length; i++) {
    
        svgRestrictionSiteDetails.append("rect")
            .attr("x", 200 + (unitWidthTotal * (i + 1)) - 7)
            .attr("y", 70 - (unitHeight / 2))
            .attr("width", unitWidth)
            .attr("height", unitHeight)
            .attr("fill", restrictionSequence[i].getDisplayColor());

        svgRestrictionSiteDetails.append("text")
            .attr("x", 200 + (unitWidthTotal * (i + 1)) - 4)
            .attr("y", 70)
            .style("fill", fontDisplayColor)
            .attr("dy", ".4em")
            .attr("font-size", "12px")
            .attr("text-align", "center")
            .text(restrictionSequence[i].getDisplayBase());
    }
}


/*function drawSingleRestrictionSiteForAllGroups(signatureWindow, restrictionSiteName, selectedGroup, groups, restrictionWindowDisplayWidth, rootSequence) {

    const elementHeight = 20;
    const elementWidth = elementHeight;
    const tickWidth = 3;

    const sequenceLength = rootSequence.length;

    const allRestrictionSites = getAllRestrictionSites(rootSequence, groups, mutationsMap);

    // Selecting the container for the SVG
    const singleEnzymeSitesContent = select(signatureWindow.document.getElementById('singleEnzymeSites'));
    
    // Clearing previous content
    singleEnzymeSitesContent.selectAll("*").remove();

    // Index for positioning the groups vertically
    let index = 0;

    // Loop through each group
    groups.forEach((group) => {
        
        const groupName = group[0];
        const groupColor = group[1];

        let y = (groupName === selectedGroup) ? 0 : 50 + (index * 25);
        index++;

        // Append a rectangle representing the group
        singleEnzymeSitesContent.append("rect")
            .attr("x", 20)
            .attr("y", y)
            .attr("width", elementWidth)
            .attr("height", elementHeight)
            .attr("stroke-width", 2)
            .attr("stroke", groupColor)
            .attr("fill", getBrighterColor(groupColor));

        // Get the restriction sites for the current group
        const groupSingleRestrictionSites = allRestrictionSites[groupName][restrictionSiteName];
        
        // Draw tick marks for each restriction site
        groupSingleRestrictionSites.forEach((position) => {
            singleEnzymeSitesContent.append("rect")
                .attr("x", 100 + (position / sequenceLength) * (restrictionWindowDisplayWidth - 100))
                .attr("y", y)
                .attr("width", tickWidth)
                .attr("height", elementHeight)
                .attr("fill", groupColor)
                .style("cursor", "pointer");
        });
    });
}*/


export const populateAAAlignment = (signatureWindow, currentCDS, selectedGroup, groups, mutationsMap, rootSequence) => {


    // Selecting the container for the SVG
    const aaAlignmentLegendDiv = signatureWindow.document.getElementById('aaMSALegend');
    const aaAlignmentDiv = signatureWindow.document.getElementById('aaMSA');

    const baseAASequence = getAminoAcidSequence(currentCDS, retrieveSequence(rootSequence, []));
    const svgWidth = (baseAASequence.length + 2) * unitWidthTotal;

    const start = 1;
    const stop = baseAASequence.length;

    var svgAAAlignmentLegend = select(aaAlignmentLegendDiv)
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%");
        //.style("background-color", "pink");

    var svgAAAlignment = select(aaAlignmentDiv)
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
    var xAxisGroup = svgAAAlignment.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0, 40)")
        .call(xAxis);
    xAxisGroup.selectAll(".tick line")
        .style("stroke", "black"); // Adjust tick color
    xAxisGroup.selectAll(".tick text")
        .style("font-size", "10px") // Adjust font size
        .style("fill", "black"); // Adjust text color

    let yIndex = 110;

    for(var i = 0; i < groups.length; i++) {

        const currentGroup = groups[i];
        const currentGroupName = currentGroup[0];
        const currentGroupColor = currentGroup[1];
        const currentGroupDNASequence = retrieveSequence(rootSequence, mutationsMap.get(currentGroupName));
        const currentGroupAASequence = getAminoAcidSequence(currentCDS, currentGroupDNASequence);
        
        let y = yIndex;

        if(currentGroupName === selectedGroup) {
            y = 80;
        }
        else {
            yIndex += 20;
        }

        // Draw the sequence:
        let displayIndex = 0;
        let aaRect = [];
            
        for (let i = 0; i < currentGroupAASequence.length; i++) {
        
            // Append a rectangle representing the group
            svgAAAlignmentLegend.append("rect")
                .attr("x", 20)
                .attr("y", y - (unitHeight / 2))
                .attr("width", unitWidth)
                .attr("height", unitHeight)
                .attr("stroke-width", 2)
                .attr("stroke", currentGroupColor)
                .attr("fill", getBrighterColor(currentGroupColor))
                .on("mouseover", function() {
                    groupTooltip.text(currentGroupName);
                })
                .on("mouseout", function() {
                    groupTooltip.text("");
                });
        
            var groupTooltip = svgAAAlignmentLegend.append("text")
                .attr("x", 20)
                .attr("y", 50)
                .style("fill", "black")
                .style("font-size", "12px")
                .style("pointer-events", "none");
                
            aaRect[i] = svgAAAlignment.append("rect")
                .attr("x", (unitWidthTotal * (displayIndex + 1)) - 7)
                .attr("y", y - (unitHeight / 2))
                .attr("width", unitWidth)
                .attr("height", unitHeight)
                .attr("fill", currentGroupAASequence[i].getDisplayColor());
            
            let aa = svgAAAlignment.append("text")
                .attr("x", (unitWidthTotal * (displayIndex + 1)) - 4)
                .attr("y", y)
                .style("fill", fontDisplayColor)
                .attr("dy", ".4em")
                .attr("font-size", "12px")
                .attr("text-align", "center")
                .text(currentGroupAASequence[i].getDisplayAminoAcid())
                .style("cursor", "pointer");
        
            displayIndex++;
        }
    }
}


function getHeaderDiv(groupCategory, group, position, orf) {

    let header = "<div class=\"header\">";
    header += "<img src=\"../../../dist/1730310c32752e095ee7.svg\"/>";
    header += "<h1>Signature Selector</h1><br/>";
    header += "<ul>";
    header += "<li>Group Category: <span class=\"dataText\">" + groupCategory.charAt(0).toUpperCase() + groupCategory.slice(1) + "</span></li>";
    header += "<li>Sequence Group: <span class=\"dataText\">" + trimDisplayString(group.replace(/-/g, ' ')) + "</span></li>";
    header += "<li>Selected Position: <span class=\"dataText\">" + position + "</span></li>";
    header += "<li>Selected Protein: <span class=\"dataText\">" + orf + "</span></li>";
    header += "</ul>"
    header += "</div>";

    return header;
}


function trimDisplayString(displayString) {

    const maxLength = 50;

    var trimmedDisplayString = displayString.substring(0, maxLength);

    if(displayString.length > maxLength) {
        trimmedDisplayString += ' ...';
    }

    return trimmedDisplayString;
}


function getTabDiv() {

    let tabs = "<div class=\"tab\">";
    tabs += "<button id=\"ampliconButton\" class=\"tablinks\" style=\"font-weight: bold;\">Amplicon Selection</button>";
    tabs += "<button id=\"aaAlignmentButton\" class=\"tablinks\" style=\"font-weight: bold;\">ORF AA Alignments</button>";
    tabs += "<button id=\"restrictionButton\" class=\"tablinks\" style=\"font-weight: bold;\">Restriction Comparison</button>";
    tabs += "</div>";

    return tabs;
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
            display: flex;
            flex-direction: column;
            min-height: 100vh; /* Ensure the body takes at least the full height of the viewport */
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
            margin-left: 20px;
            margin-top: 10px;
            margin-bottom: 10px;
            font-weight: 500;
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
        /*.restrictionComparison {
            width: 100%;
            height: 100%;
            margin: 0 auto;
            font-family: Lato, &quot;Helvetica Neue&quot;, Helvetica, sans-serif;
            font-size: 20px;
            letter-spacing: 0.4rem;
            margin-left: 5px;
            margin-top: 5px;
            margin-bottom: 5px;
            font-weight: 350;
            overflow-y: scroll;
            style="overflow-wrap: break-word;"
            flex: 1;
        }*/
        .horizontalScrollPane {
            width: 100%;
            height: 60%;
            flex: 1;
            overflow-x: scroll;
            overflow-y: hidden;
            scrollbar-base-color: "pink";
        }
        .verticalScrollPane {
            width: 100%;
            height: 60%;
            flex: 1;
            overflow-x: hidden;
            overflow-y: scroll;
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
            width: 100%;
            text-align: left;
            color: #D3D3D3;
            list-style-type: none;
        }
        .header ul li {
            width: 100%;
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
            position: fixed; bottom: 0;
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
        .tab {
            overflow: hidden;
            //border: 1px solid #ccc;
            //background-color: #f1f1f1;
        }
        .tab button {
            background-color: inherit;
            float: left;
            border: none;
            outline: none;
            cursor: pointer;
            padding: 14px 16px;
            transition: 0.3s;
        }
    `;

    style += "</style>";

    return style;
}
