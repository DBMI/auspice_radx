import { range } from "d3-array";
import { axisBottom, axisTop } from "d3-axis";
import { scaleLinear } from "d3-scale";
import { select } from "d3-selection";
import { lowerCase } from "lodash";
import { RestrictionSiteInfo, getRestrictionSiteNames, getRestrictionSites, getNonConservedRestrictionSites, getRestrictionSiteLength, hasRestrictionSite, bulkRemoveRestrictionSites } from "./helpers/restrictionAnalysis";
import { getBrighterColor } from "../../../util/colorHelpers";
import { retrieveSequence } from "./../signaturesHelpers";
import { getAminoAcidSequence, getReplacementCodons } from "./helpers/dnaToAA";
import { replaceSequence } from "./helpers/sequenceTools";

const w = 900;
const h = 750;
const unitWidth = 15;
const unitHeight = unitWidth;
const unitBuffer = 5;
const unitWidthTotal = unitWidth + unitBuffer;
const fontDisplayColor = "#000000";
const selectedColor = "#FFF200";
const selectedColorMutant = "#ED7014";
const selectedColorIntroducedMutant = '#03AC13';

const AMPLICON_TAB = "AMPLICON";
const ALIGNMENT_TAB = "ALIGNMENT";
const RESTRICTION_TAB = "RESTRICTION";
const RESTRICTION_DESIGN_TAB = "RESTRICTION_DESIGN";
const RESTRICTION_REMOVAL_TAB = "RESTICTION_REMOVAL"; 

let actualWidth = w;    // Reset this when creating the window below.
let actualHeight = h;   // Reset this when creating the window below.

let selectedTab = AMPLICON_TAB;
let selectedRestrictionSiteNamesForRemoval = new Set(); // The names of selected restriction sites.



export const displaySignatureWindow = () => {

    // Thisglobal variable needs to be reset for each new window.
    selectedRestrictionSiteNamesForRemoval = new Set();

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

    const restrictionSiteNames = getRestrictionSiteNames();

    let html = "<html>";

    // HEAD

    html += "<head>";
    html += "<title>SIGNATURE SELECTOR</title>";
    html += getSignatureWindowStyle();
    html += "</head>";

    // BODY

    html += "<body>";

    html += getHeaderDiv(groupCategory, group, position, orf);

    html += "<div class=\"wrapper\">";  // Wrapper Open

    html += getTabDiv();

    html += "<div id=\"ampliconSelection\" class=\"tabcontent\" style=\"display: block; height: 100%;\">";
    html += "<div id=\"selection\" class=\"horizontalScrollPane\" style=\"width: 100%; height: 30%;\"><svg id=\"selectionSvg\" style=\"height: 100%; width: 100%; background: #f0f0f0;\"/></div>";
    html += "<div id=\"results\" class=\"results horizontalScrollPane\" style=\"width: 100%; height: 50%;\"><svg id=\"resultsSvg\" style=\"height: 100%; width: 100%; background: #f0f0f0;\"/></div>";
    html += "</div>";

    html += "<div id=\"aaAlignment\" class=\"tabcontent\" style=\"display: none; height: 100%;\">";
    html += "<div style=\"display: flex; height: 25%;\">";
    html += "<div id=\"aaMSALegend\" style=\"width: 80px; flex-shrink: 0;\"></div>";
    html += "<div id=\"aaMSA\" style=\"width: calc(100% - 80px); height: 100%; overflow-x: scroll; overflow-y: hidden;\"></div>";
    html += "</div>";
    html += "<div id=\"aaSelection\" class=\"results horizontalScrollPane\" style=\"width: 100%; height: 25%; \"><svg id=\"aaSelectionSvg\" style=\"height: 100%; width: 100%; background: #f0f0f0;\"/></div>";
    html += "<div id=\"aaResults\" class=\"results horizontalScrollPane\" style=\"width: 100%; height: 25%;\"><svg id=\"aaResultsSvg\" style=\"height: 100%; width: 100%; background: #f0f0f0;\"/></div>";
    html += "</div>";

    html += "<div id=\"restrictionComparison\" class=\"tabcontent\" style=\"display: none; height: 100%;\">";
    html += "<div id=\"nonConservedSites\" class=\"verticalScrollPane\" style=\"height: 40%\"></div>";
    html += "<div id=\"restrictionSiteDetails\" style=\"display: none; height: 60%\"></div>";
    html += "</div>";

    html += "<div id=\"restrictionDesign\" class=\"tabcontent\" style=\"display: none; height: 100%;\">";
    html += "<div id=\"restrictionDesignDetails\" style=\"height: 14%\"></div>";
    html += "<div id=\"restrictionDesignSiteDetails\" class=\"horizontalScrollPane\" style=\"height: 18%; width: 100%;\"></div>";
    html += "<div id=\"restrictionDesignSiteSelection\" class=\"horizontalScrollPane\" style=\"height: 18%; width: 100%;\"><svg id=\"restrictionDesignSelectionSvg\" style=\"height: 100%; width: 100%; background: #f0f0f0;\"/></div>";
    html += "<div id=\"restrictionDesignSiteSelectionResults\" style=\"height: 50%; width: 100%;\"><svg id=\"restrictionDesignSelectionResultsSvg\" style=\"height: 100%; width: 100%; background: #f0f0f0;\"/></div>";
    html += "</div>";

    html += "<div id=\"restrictionRemoval\" class=\"tabcontent\" style=\"display: none; height: 100%;\">";
    html += "<div id=\"restrictionRemovalDetails\" style=\"height: 14%\"></div>";
    html += "<div id=\"restrictionRemovalDetailsList\" style=\"height: 86%\"><svg id=\"restrictionRemovalListSvg\" style=\"height: 100%; width: 100%; background: #f0f0f0;\"/></div>";
    html += "</div>";
    
    html += "</div>";  // Wrapper Close

    html += getFooterDiv();

 

    html += "</body>";

    html += "</html>";

    return html;
}



export const initializeTabButtons = (signatureWindow) => {

    const ampliconSelectionDiv = signatureWindow.document.getElementById("ampliconSelection");
    const aaAlignmentDiv = signatureWindow.document.getElementById("aaAlignment");
    const restrictionComparisonDiv = signatureWindow.document.getElementById("restrictionComparison");
    const restrictionDesignDiv = signatureWindow.document.getElementById("restrictionDesign");
    const restrictionRemovalDiv = signatureWindow.document.getElementById("restrictionRemoval");

    const ampliconButton = signatureWindow.document.getElementById("ampliconButton");
    const aaAlignmentButton = signatureWindow.document.getElementById("aaAlignmentButton");
    const restrictionButton = signatureWindow.document.getElementById("restrictionButton");
    const restrictionDesignButton = signatureWindow.document.getElementById("restrictionDesignButton");
    const restrictionRemovalButton = signatureWindow.document.getElementById("restrictionRemovalButton");

    signatureWindow.document.getElementById('selectRestrictionSite').disabled = true;

    const selectedBackgroundColor = "#f0f0f0";

    ampliconButton.style.background = selectedBackgroundColor;
    ampliconButton.style.fontDisplayColor = '#5da8a3';

    aaAlignmentButton.style.background = '#D3D3D3';
    aaAlignmentButton.style.fontDisplayColor = '#30353F';

    restrictionButton.style.background = '#D3D3D3';
    restrictionButton.style.fontDisplayColor = '#30353F';

    restrictionDesignButton.style.background = '#D3D3D3';
    restrictionDesignButton.style.fontDisplayColor = '#30353F';

    restrictionRemovalButton.style.background = '#D3D3D3';
    restrictionRemovalButton.style.fontDisplayColor = '#30353F';

    ampliconButton.addEventListener("click", function() { 

        ampliconSelectionDiv.style.display = "block";
        aaAlignmentDiv.style.display = "none";
        restrictionComparisonDiv.style.display = "none";
        restrictionDesignDiv.style.display = "none";
        restrictionRemovalDiv.style.display = "none";

        signatureWindow.document.getElementById('selectRestrictionSite').disabled = true;

        ampliconButton.style.background = selectedBackgroundColor;
        ampliconButton.style.fontDisplayColor = '##5da8a3';

        aaAlignmentButton.style.background = '#D3D3D3';
        aaAlignmentButton.style.fontDisplayColor = '#30353F';

        restrictionButton.style.background = '#D3D3D3';
        restrictionButton.style.fontDisplayColor = '#30353F';

        restrictionDesignButton.style.background = '#D3D3D3';
        restrictionDesignButton.style.fontDisplayColor = '#30353F';

        restrictionRemovalButton.style.background = '#D3D3D3';
        restrictionRemovalButton.style.fontDisplayColor = '#30353F';

        selectedTab = AMPLICON_TAB;
    });

    aaAlignmentButton.addEventListener("click", function() {

        ampliconSelectionDiv.style.display = "none";
        aaAlignmentDiv.style.display = "block";//"flex";
        restrictionComparisonDiv.style.display = "none";
        restrictionDesignDiv.style.display = "none";
        restrictionRemovalDiv.style.display = "none";
        
        signatureWindow.document.getElementById('selectRestrictionSite').disabled = true;

        ampliconButton.style.background = '#D3D3D3';
        ampliconButton.style.fontDisplayColor = '#30353F';

        aaAlignmentButton.style.background = selectedBackgroundColor;
        aaAlignmentButton.style.fontDisplayColor = '##5da8a3';

        restrictionButton.style.background = '#D3D3D3';
        restrictionButton.style.fontDisplayColor = '#30353F';

        restrictionDesignButton.style.background = '#D3D3D3';
        restrictionDesignButton.style.fontDisplayColor = '#30353F';

        restrictionRemovalButton.style.background = '#D3D3D3';
        restrictionRemovalButton.style.fontDisplayColor = '#30353F';

        selectedTab = ALIGNMENT_TAB;
    });

    restrictionButton.addEventListener("click", function() { 

        ampliconSelectionDiv.style.display = "none";
        aaAlignmentDiv.style.display = "none";
        restrictionComparisonDiv.style.display = "block";
        restrictionDesignDiv.style.display = "none";
        restrictionRemovalDiv.style.display = "none";
        
        signatureWindow.document.getElementById('selectRestrictionSite').disabled = true;

        ampliconButton.style.background = '#D3D3D3';
        ampliconButton.style.fontDisplayColor = '#30353F';

        aaAlignmentButton.style.background = '#D3D3D3';
        aaAlignmentButton.style.fontDisplayColor = '#30353F';

        restrictionButton.style.background = selectedBackgroundColor;
        restrictionButton.style.fontDisplayColor = '##5da8a3';

        restrictionDesignButton.style.background = '#D3D3D3';
        restrictionDesignButton.style.fontDisplayColor = '#30353F';

        restrictionRemovalButton.style.background = '#D3D3D3';
        restrictionRemovalButton.style.fontDisplayColor = '#30353F';

        selectedTab = RESTRICTION_TAB;
    });

    restrictionDesignButton.addEventListener("click", function() { 

        ampliconSelectionDiv.style.display = "none";
        aaAlignmentDiv.style.display = "none";
        restrictionComparisonDiv.style.display = "none";
        restrictionDesignDiv.style.display = "block";
        restrictionRemovalDiv.style.display = "none";
        
        signatureWindow.document.getElementById('selectRestrictionSite').disabled = false;
        
        ampliconButton.style.background = '#D3D3D3';
        ampliconButton.style.fontDisplayColor = '#30353F';

        aaAlignmentButton.style.background = '#D3D3D3';
        aaAlignmentButton.style.fontDisplayColor = '#30353F';

        restrictionButton.style.background = '#D3D3D3';
        restrictionButton.style.fontDisplayColor = '##5da8a3';

        restrictionDesignButton.style.background = selectedBackgroundColor;
        restrictionDesignButton.style.fontDisplayColor = '#30353F';

        restrictionRemovalButton.style.background = '#D3D3D3';
        restrictionRemovalButton.style.fontDisplayColor = '#30353F';

        selectedTab = RESTRICTION_DESIGN_TAB;
    });

    restrictionRemovalButton.addEventListener("click", function() { 

        ampliconSelectionDiv.style.display = "none";
        aaAlignmentDiv.style.display = "none";
        restrictionComparisonDiv.style.display = "none";
        restrictionDesignDiv.style.display = "none";
        restrictionRemovalDiv.style.display = "block";
        
        signatureWindow.document.getElementById('selectRestrictionSite').disabled = false;
        
        ampliconButton.style.background = '#D3D3D3';
        ampliconButton.style.fontDisplayColor = '#30353F';

        aaAlignmentButton.style.background = '#D3D3D3';
        aaAlignmentButton.style.fontDisplayColor = '#30353F';

        restrictionButton.style.background = '#D3D3D3';
        restrictionButton.style.fontDisplayColor = '##5da8a3';

        restrictionDesignButton.style.background = '#D3D3D3';
        restrictionDesignButton.style.fontDisplayColor = '#30353F';

        restrictionRemovalButton.style.background = selectedBackgroundColor;
        restrictionRemovalButton.style.fontDisplayColor = '#30353F';

        selectedTab = RESTRICTION_REMOVAL_TAB;
    });
}



export const initializeRestrictionSelect = (signatureWindow, currentGroup, groups, mutationsMap, rootSequence, genomeAnnotations) => {

    const selectRestrictionSite = signatureWindow.document.getElementById('selectRestrictionSite');

    selectRestrictionSite.addEventListener('change', function() {

        const restrictionSiteSelected = selectRestrictionSite.value;

        if(selectedTab === RESTRICTION_DESIGN_TAB) {
            populateRestrictionDesignMap(restrictionSiteSelected, signatureWindow, currentGroup, groups, mutationsMap, rootSequence, genomeAnnotations);
        }
        else if(selectedTab == RESTRICTION_REMOVAL_TAB) {

            if(selectedRestrictionSiteNamesForRemoval.has(restrictionSiteSelected)) {
                selectedRestrictionSiteNamesForRemoval.delete(restrictionSiteSelected);
            }
            else {
                selectedRestrictionSiteNamesForRemoval.add(restrictionSiteSelected);
            }

            populateRestrictionRemovalMap([...selectedRestrictionSiteNamesForRemoval].sort(), signatureWindow, currentGroup, groups, mutationsMap, rootSequence, genomeAnnotations);
        };
    });

    selectRestrictionSite.addEventListener('click', function() {
        console.log("SELECTED", selectRestrictionSite.value);
    })
}



export const populateSignatureSequence = (signatureWindow, sequence, position, selectionDiv, resultsDiv, selectionSvgId, resultsSvgId, aaSequence, restrictionSiteInfo) => {

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

    var selectionContent = signatureWindow.document.getElementById(selectionDiv);
    var resultsContent = signatureWindow.document.getElementById(resultsDiv);

    var svg = select(signatureWindow.document.querySelector(`#${selectionSvgId}`));
    svg.selectAll("*").remove();
    svg.style("width", svgWidth + "px");
    
    var resultsSvg = select(signatureWindow.document.querySelector(`#${resultsSvgId}`));
    resultsSvg.selectAll("*").remove();

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
        .attr("transform", "translate(0, 70)")
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
        .attr("transform", "translate(0, 150)")
        .call(xAxisRelative);
    xAxisGroupRelative.selectAll(".tick line")
        .style("stroke", "black"); // Adjust tick color
    xAxisGroupRelative.selectAll(".tick text")
        .style("font-size", "10px") // Adjust font size
        .style("fill", "black"); // Adjust text color

    let selectedBases = [];
    drawSelectSequence(sequence, start, stop, selectedBases, svg, resultsSvg, resultsContent, aaSequence, restrictionSiteInfo);

    let midpoint = (svgWidth / 2) - (w * 3 / 4)
    
    setTimeout(() => {
        selectionContent.scrollLeft = midpoint;
    }, 100);
}


function drawSelectSequence(sequence, start, stop, selectedBases, svg, resultsSvg, resultsContent, aaSequence, restrictionSiteInfo) {

    // Draw the sequence:
    let displayIndex = 0;
    let baseRect = [];

    for (let i = start; i <= stop; i++) {

        // If an AA sequence is provided draw it just above the respective codons in the DNA sequence.
        if(aaSequence !== null) {

            var aminoAcid = aaSequence.find(aminoAcid => aminoAcid.genomeCodonStartPosition === i);
            if(aminoAcid) {

                svg.append("rect")
                    .attr("x", (unitWidthTotal * (displayIndex + 1)) - 7)
                    .attr("y", 95 - (unitHeight / 2))
                    .attr("width", (unitWidth * 3) + 10) // Make it the width of amino acid representations that of three bases.
                    .attr("height", unitHeight)
                    .attr("fill", aminoAcid.getDisplayColor());

                svg.append("text")
                    .attr("x", (unitWidthTotal * (displayIndex + 1)) - 4 + unitWidthTotal) // Center the text horizontally in the rectangle.
                    .attr("y", 95)
                    .style("fill", fontDisplayColor)
                    .attr("dy", ".4em")
                    .attr("font-size", "12px")
                    .attr("text-align", "center")
                    .text(aminoAcid.getDisplayAminoAcid())
            }
        }


        if((restrictionSiteInfo !== null) && (sequence[i].location == restrictionSiteInfo.startPosition)) {

            svg.append('rect')
                .attr("x", (unitWidthTotal * (displayIndex + 1)) - 7)
                .attr("y", 95 - (unitHeight / 2))
                .attr("width", unitWidthTotal * (restrictionSiteInfo.length) - 5)
                .attr("height", unitHeight)
                .attr("fill", getBrighterColor(restrictionSiteInfo.displayColor));

            svg.append("text")
                .attr("x", (unitWidthTotal * (displayIndex + 1)) - 7 + (unitWidthTotal * (restrictionSiteInfo.length)) / 2) // Center horizontally
                .attr("y", 95)
                .style("fill", fontDisplayColor)
                .attr("dy", ".4em")
                .attr("font-size", "12px")
                .attr("text-anchor", "middle") // Set text anchor to middle for horizontal centering
                .text("(" + restrictionSiteInfo.restrictionSiteName + ")");
        }

    
        baseRect[i] = svg.append("rect")
            .attr("x", (unitWidthTotal * (displayIndex + 1)) - 7)
            .attr("y", 120 - (unitHeight / 2))
            .attr("width", unitWidth)
            .attr("height", unitHeight)
            .attr("fill", sequence[i].getDisplayColor());

        let base = svg.append("text")
            .attr("x", (unitWidthTotal * (displayIndex + 1)) - 4)
            .attr("y", 120)
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
                    if(sequence[i].containsIntroducedMutations()) {
                        baseRect[i].attr("fill", selectedColorIntroducedMutant);
                    }
                    else if(sequence[i].containsMutations()) {
                        baseRect[i].attr("fill", selectedColorMutant);
                    }
                    else if(sequence[i].containsIntroducedMutations()) {
                        baseRect[i].attr("fill", selectedColorIntroducedMutant);
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
                        if(sequence[n].containsIntroducedMutations()) {
                            baseRect[n].attr("fill", selectedColorIntroducedMutant);
                        }
                        else if(sequence[n].containsMutations()) {
                            baseRect[n].attr("fill", selectedColorMutant);
                        }
                        else {
                            baseRect[n].attr("fill", selectedColor);
                        }
                    }
                    displayResults(resultsSvg, sequence, selectedBases, resultsContent);
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


function displayResults(resultsSvg, sequence, selectedBases, resultsContent) {

    const start = Math.min(selectedBases[0], selectedBases[1]);
    const stop = Math.max(selectedBases[0], selectedBases[1]);
    const svgWidth = Math.max(((stop - start + 2) * unitWidthTotal), resultsContent.offsetWidth);
    
    removeResults(resultsSvg);

    resultsSvg.style("width", svgWidth + "px");
    
    let seqString = "";

    for(let i = selectedBases[0]; i <= selectedBases[1]; i++) {
        seqString += getDisplayCase(sequence[i]);
    }

    resultsSvg.append("text")
        .attr("x", 100)
        .attr("y", 25)
        .style("fill", fontDisplayColor)
        .attr("dy", "1em")
        .attr("font-size", "20px")
        .attr("text-align", "center")    
        .text(seqString);

    resultsSvg.append("text")
        .attr("x", 100)
        .attr("y", 65)
        .style("fill", fontDisplayColor)
        .attr("dy", "1em")
        .attr("font-size", "20px")
        .attr("text-align", "center")    
        .text("Start Position: " + selectedBases[0]);

    resultsSvg.append("text")
        .attr("x", 100)
        .attr("y", 90)
        .style("fill", fontDisplayColor)
        .attr("dy", "1em")
        .attr("font-size", "20px")
        .attr("text-align", "center")    
        .text("Stop Position: " + selectedBases[1]);

    resultsSvg.append("text")
        .attr("x", 100)
        .attr("y", 115)
        .style("fill", fontDisplayColor)
        .attr("dy", "1em")
        .attr("font-size", "20px")
        .attr("text-align", "center")    
        .text("Length: " + seqString.length);

    resultsSvg.append("text")
        .attr("x", 500)
        .attr("y", 65)
        .style("fill", fontDisplayColor)
        .attr("dy", "1em")
        .attr("font-size", "20px")
        .attr("text-align", "center")    
        .text("Tm: " + getTm(seqString) + "°");

    resultsSvg.append("text")
        .attr("x", 500)
        .attr("y", 90)
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



export const populateRestrictionComparisonMap = (signatureWindow, currentGroup, groups, mutationsMap, rootSequence, genomeAnnotations) => {

    const elementHeight = 20;
    const nonConservedRestrictionSites = getNonConservedRestrictionSites(rootSequence, groups, mutationsMap);
    const restrictionWindowDisplayWidth = actualWidth - 100;

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

    drawORFMap(restrictionWindowDisplayWidth, svgNonConserved, elementHeight, rootSequence, genomeAnnotations);

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


function drawORFMap(restrictionWindowDisplayWidth, svg, elementHeight, rootSequence, genomeAnnotations) {

    // Draws the blocks representing the ORFs for the different potein coding regions.

    genomeAnnotations.forEach((orf) => {
        
        const orfProtein = orf['prot'];
        const orfDirection = orf['strand'];
        const orfStart = orf['start'];
        const orfEnd = orf['end'];
        const orfColor = orf['fill'];
    
        var orfX = (orfStart / rootSequence.length) * (restrictionWindowDisplayWidth - 100);
        var orfWidth = ((orfEnd / rootSequence.length) * (restrictionWindowDisplayWidth - 100)) - orfX;
    
        svg.append("rect")
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
    
        var tooltip = svg.append("text")
            .attr("x", 100 + orfX + (orfWidth / 2))
            .attr("y", 25)
            .attr("text-anchor", "middle")
            .style("fill", "black")
            .style("font-size", "12px")
            .style("pointer-events", "none");
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



function drawRestrictionSiteDetails(signatureWindow, divRestrictionSiteDetails, svgRestrictionSiteDetails, restrictionStart, restrictionSiteName, groupName, groupColor, groupDNASequence, genomeAnnotations) {

    const restrictionStop = restrictionStart + getRestrictionSiteLength(restrictionSiteName);
    const restrictionFrame = getRestrictionFrame(groupDNASequence, restrictionStart, restrictionStop, genomeAnnotations);
    const restrictionRelativeStart = restrictionFrame['restrictionRelativeStart'];
    const restrictionFrameSequence = restrictionFrame['restrictionFrameSequence'];
    const restrictionSiteInfo = new RestrictionSiteInfo(restrictionSiteName, restrictionStart, groupColor);

    svgRestrictionSiteDetails.selectAll("*").remove();

    svgRestrictionSiteDetails.append('text')
        .attr("x", 25)
        .attr("y", 10)
        .style("fill", fontDisplayColor)
        .attr("dy", ".4em")
        .attr("font-size", "16px")
        .text(groupName + " (" + restrictionStart + ")");

    svgRestrictionSiteDetails.append('text')
        .attr("x", 25)
        .attr("y", 40)
        .style("fill", fontDisplayColor)
        .attr("dy", ".4em")
        .attr("font-size", "14px")
        .text("Select Replacement Sequence");
    
    svgRestrictionSiteDetails.append('rect')
        .attr("x", 300 + (unitWidthTotal * (restrictionRelativeStart + 1)) - 7)
        .attr("y", 10 - (unitHeight / 2))
        .attr("width", unitWidthTotal * (restrictionStop - restrictionStart) - 5)
        .attr("height", unitHeight)
        .attr("fill", getBrighterColor(groupColor));

    svgRestrictionSiteDetails.append("text")
        .attr("x", 300 + (unitWidthTotal * (restrictionRelativeStart + 1)) - 7 + (unitWidthTotal * (restrictionStop - restrictionStart)) / 2) // Center horizontally
        .attr("y", 10)
        .style("fill", fontDisplayColor)
        .attr("dy", ".4em")
        .attr("font-size", "12px")
        .attr("text-anchor", "middle") // Set text anchor to middle for horizontal centering
        .text(restrictionSiteName);

    for(let i = 0; i < restrictionFrameSequence.length; i++) {
    
        svgRestrictionSiteDetails.append("rect")
            .attr("x", 300 + (unitWidthTotal * (i + 1)) - 7)
            .attr("y", 40 - (unitHeight / 2))
            .attr("width", unitWidth)
            .attr("height", unitHeight)
            .attr("fill", restrictionFrameSequence[i].getDisplayColor());

        svgRestrictionSiteDetails.append("text")
            .attr("x", 300 + (unitWidthTotal * (i + 1)) - 4)
            .attr("y", 40)
            .style("fill", fontDisplayColor)
            .attr("dy", ".4em")
            .attr("font-size", "12px")
            .attr("text-align", "center")
            .text(restrictionFrameSequence[i].getDisplayBase());
    }

    var restrictionFrameSequenceString = '';
    restrictionFrameSequence.forEach((base) => {
        restrictionFrameSequenceString = restrictionFrameSequenceString + base.getDisplayBase();
    });

    // Grab all matching replacementCodons for each codon in a 2D array.
    var codonIndex = 0;
    var replacementCodons = [];
    for(let i = 0; i < restrictionFrameSequenceString.length; i += 3) {
        const codon = restrictionFrameSequenceString.substring(i, i + 3);
        replacementCodons[codonIndex++] = getReplacementCodons(codon, 'hs', 0.10);
    }

    // Create an array of all possible codon combinations as strings.
    var possibleSequenceStrings = [];
    generateCombinations(replacementCodons, 0, [], possibleSequenceStrings);
    
    // Iterate over each string in possibleSequenceStrings
    var sequenceStringsNotContainingRestrictionSite = [];
    possibleSequenceStrings.forEach((sequence) => {
        // Check if the sequence string does not contain the restriction site pattern
        if (!hasRestrictionSite(restrictionSiteName, sequence)) {
            // If it doesn't, add it to sequenceStringsNotContainingRestrictionSite
            sequenceStringsNotContainingRestrictionSite.push(sequence);
        }
    });

    const columnWidth = 200; // Width of each column
    const lineHeight = 30; // Height of each line
    const maxRows = 3; // Maximum rows per column
    const maxColumns = Math.ceil(sequenceStringsNotContainingRestrictionSite.length / maxRows); // Maximum number of columns
    const svgWidth = Math.max(((maxColumns + 1) * columnWidth), divRestrictionSiteDetails.offsetWidth);
    svgRestrictionSiteDetails.style("width", svgWidth + "px");

    // Loop over sequenceStringsNotContainingRestrictionSite
    sequenceStringsNotContainingRestrictionSite.forEach((replacementSequence, index) => {
        // Calculate position based on index and column width
        const column = Math.floor(index / maxRows); // Determine the column
        const rowInColumn = index % maxRows; // Determine the row within the column
        const x = 50 + column * columnWidth; // Calculate x position
        const y = 90 + rowInColumn * lineHeight; // Calculate y position

        // Append text to SVG
        svgRestrictionSiteDetails.append("text")
            .attr("x", x)
            .attr("y", y)
            .style("fill", "black")
            .attr("font-family", "Courier") // Use Courier font
            .attr("font-size", "16px")
            .text(replacementSequence)
            .style("cursor", "pointer")
            .on("click", function() {
                select(signatureWindow.document.querySelector(`#restrictionDesignSelectionSvg`)).selectAll("*").remove();
                select(signatureWindow.document.querySelector(`#restrictionDesignSelectionResultsSvg`)).selectAll("*").remove();
                const restrictionFrameStart = restrictionFrameSequence[0]['location'];
                const newGroupDNASequence = replaceSequence(groupDNASequence, restrictionFrameSequence, replacementSequence);  
                populateSignatureSequence(signatureWindow, newGroupDNASequence, restrictionFrameStart, 'restrictionDesignSiteSelection', 'restrictionDesignSiteSelectionResults', 'restrictionDesignSelectionSvg', 'restrictionDesignSelectionResultsSvg', null, restrictionSiteInfo);           
            });
    });
}


// Recursive function to generate all combinations
function generateCombinations(arrays, currentIndex, currentCombination, allCombinations) {
    if (currentIndex === arrays.length) {
        // Base case: All sub-arrays have been processed, add current combination to the result
        allCombinations.push(currentCombination.join(''));
        return;
    }
    // Iterate over the current sub-array
    for (let i = 0; i < arrays[currentIndex].length; i++) {
        // Recursively call the function with the next sub-array
        generateCombinations(arrays, currentIndex + 1, currentCombination.concat(arrays[currentIndex][i]), allCombinations);
    }
}



function getRestrictionFrame(groupDNASequence, restrictionStart, restrictionStop, genomeAnnotations) {

    const orf = getCurrentOrf(restrictionStart, restrictionStop, genomeAnnotations);
    const restrictionLength = restrictionStop - restrictionStart;
    const orfStart = orf['start'] + 1;
    const restrictionFrameOffset = orfStart % 3;
    const restrictionFrameStart = restrictionStart - restrictionFrameOffset;
    const restrictionFrameStop = restrictionFrameStart + restrictionLength + (3 - (restrictionLength % 3));
    const restrictionFrameSequence = groupDNASequence.slice(restrictionFrameStart, restrictionFrameStop);
    const restrictionFrame = { restrictionRelativeStart: (restrictionStart - restrictionFrameStart) , restrictionFrameSequence: restrictionFrameSequence };

    return restrictionFrame;
}



function getCurrentOrf(start, stop, genomeAnnotations) {

    return genomeAnnotations.find((orf) => {
        if (orf['strand'] === '+') {
            if(orf['start'] <= start && orf['end'] >= stop) {
                return true; // This indicates to Array.find() that the item was found
            }
        }
        return false; // If condition not met, indicate to Array.find() to continue searching
    }) || null; // Return null if no matching ORF is found
}



export const populateRestrictionDesignMap = (restrictionSiteName, signatureWindow, currentGroup, groups, mutationsMap, rootSequence, genomeAnnotations) => {

    const elementHeight = 20;
    const tickWidth = 3;
    const restrictionWindowDisplayWidth = actualWidth - 100;
    const group = getGroup(groups, currentGroup);
    const groupName = group[0];
    const groupColor = group[1];
    const sequenceLength = rootSequence.length;

    var restrictionDesignDetailsContent = signatureWindow.document.getElementById('restrictionDesignDetails');
    var restrictionDesignSiteDetailsContent = signatureWindow.document.getElementById('restrictionDesignSiteDetails');

    var restrictionSiteDisplayName = '';
    var restrictionSites = [];
    var groupDNASequence = null;

    restrictionDesignDetailsContent.style.display = "block";

    // Clear existing DIV content
    restrictionDesignDetailsContent.innerHTML = '';
    restrictionDesignSiteDetailsContent.innerHTML = '';

    // Clear existing SVG content
    select(signatureWindow.document.querySelector(`#restrictionDesignSelectionSvg`)).selectAll("*").remove();
    select(signatureWindow.document.querySelector(`#restrictionDesignSelectionResultsSvg`)).selectAll("*").remove();

    if(restrictionSiteName !== null) {
        restrictionSites = getRestrictionSites(restrictionSiteName, rootSequence, group, mutationsMap);
        groupDNASequence = retrieveSequence(rootSequence, mutationsMap.get(currentGroup));
        restrictionSiteDisplayName = restrictionSiteName;
    }


    var svgRestrictionDesign = select(restrictionDesignDetailsContent)
        .append("svg")
        .style("background-color", "#f0f0f0")
        .attr("width", "100%")
        .attr("height", "100%");

    svgRestrictionDesign.append("text")
        .text(restrictionSiteDisplayName)
        .attr("x", 15)
        .attr("y", 25)
        .style("fill", "black")
        .style("font-size", "18px")
        .style("pointer-events", "none");

    drawORFMap(restrictionWindowDisplayWidth, svgRestrictionDesign, elementHeight, rootSequence, genomeAnnotations);

    var svgRestrictionSiteDetails = select(restrictionDesignSiteDetailsContent)
        .append("svg")
        .style("background-color", "#f0f0f0")
        .attr("width", "100%")
        .attr("height", "100%");
    
    var y = 80;

    svgRestrictionDesign.append("rect")
        .attr("x", 20)
        .attr("y", y)
        .attr("width", elementHeight)
        .attr("height", elementHeight)
        .attr("stroke-width", 2)
        .attr("stroke", groupColor)
        .attr("fill", getBrighterColor(groupColor))
        .on("mouseover", function() {
            groupTooltip.text(currentGroup);
        })
        .on("mouseout", function() {
            groupTooltip.text("");
        });

    var groupTooltip = svgRestrictionDesign.append("text")
        .attr("x", 20)
        .attr("y", y - 15)
        .style("fill", "black")
        .style("font-size", "12px")
        .style("pointer-events", "none");

    restrictionSites.forEach((position) => {

        svgRestrictionDesign.append("rect")
            .attr("x", 100 + (position / sequenceLength) * (restrictionWindowDisplayWidth - 100))
            .attr("y", y)
            .attr("width", tickWidth)
            .attr("height", elementHeight)
            .attr("fill", groupColor)
            .style("cursor", "pointer")
            .on("mouseover", function () {
                tooltip.text(restrictionSiteName + " (" + position + ")");
            })
            .on("mouseout", function () {
                tooltip.text("");
            })
            .on("click", function() {
                drawRestrictionSiteDetails(signatureWindow, restrictionDesignSiteDetailsContent, svgRestrictionSiteDetails, position, restrictionSiteName, groupName, groupColor, groupDNASequence, genomeAnnotations);
            });

        var tooltip = svgRestrictionDesign.append("text")
            .attr("x", 100 + (position / sequenceLength) * (restrictionWindowDisplayWidth - 100))
            .attr("y", y - 5)
            .attr("text-anchor", "middle")
            .style("fill", "black")
            .style("font-size", "12px")
            .style("pointer-events", "none");
    });
}



function getGroup(groups, groupName) {

    const arrays = Object.values(groups);

    for(let arr of arrays) {
       if (arr[0] === groupName) {
         return arr;
       }
    }

    return null;
}



export const populateRestrictionRemovalMap = (restrictionSiteNames, signatureWindow, currentGroup, groups, mutationsMap, rootSequence, genomeAnnotations) => {

    const elementHeight = 20;
    const tickWidth = 3;
    const restrictionWindowDisplayWidth = actualWidth - 100;
    const group = getGroup(groups, currentGroup);
    const groupName = group[0];
    const groupColor = group[1];
    const sequenceLength = rootSequence.length;
    const groupDNASequence = retrieveSequence(rootSequence, mutationsMap.get(currentGroup));

    var restrictionSitesToBeRemoved = new Set();

    var restrictionRemovalDetailsContent = signatureWindow.document.getElementById('restrictionRemovalDetails');
    var restrictionRemovalDetailsListContent = signatureWindow.document.getElementById('restrictionRemovalDetailsList');

    restrictionRemovalDetailsContent.style.display = "block";

    // Clear existing DIV content
    restrictionRemovalDetailsContent.innerHTML = '';
    restrictionRemovalDetailsListContent.innerHTML = '';

    // Clear existing SVG content
    select(signatureWindow.document.querySelector(`#restrictionRemovalSvg`)).selectAll("*").remove();
    select(signatureWindow.document.querySelector(`#restrictionRemovalListSvg`)).selectAll("*").remove();

    var svgRestrictionRemoval = select(restrictionRemovalDetailsContent)
        .append("svg")
        .style("background-color", "#f0f0f0")
        .attr("width", "100%")
        .attr("height", "100%");

    drawORFMap(restrictionWindowDisplayWidth, svgRestrictionRemoval, elementHeight, rootSequence, genomeAnnotations);

    var y = 80;

    svgRestrictionRemoval.append("rect")
        .attr("x", 20)
        .attr("y", y)
        .attr("width", elementHeight)
        .attr("height", elementHeight)
        .attr("stroke-width", 2)
        .attr("stroke", groupColor)
        .attr("fill", getBrighterColor(groupColor))
        .on("mouseover", function() {
            groupTooltip.text(currentGroup);
        })
        .on("mouseout", function() {
            groupTooltip.text("");
        });

    var groupTooltip = svgRestrictionRemoval.append("text")
        .attr("x", 20)
        .attr("y", y - 15)
        .style("fill", "black")
        .style("font-size", "12px")
        .style("pointer-events", "none");


    restrictionSiteNames.forEach((restrictionSiteName) => {

        const restrictionSites = getRestrictionSites(restrictionSiteName, rootSequence, group, mutationsMap);

        restrictionSites.forEach((position) => {

            restrictionSitesToBeRemoved.add(new RestrictionSiteInfo(restrictionSiteName, position, groupColor));

            svgRestrictionRemoval.append("rect")
                .attr("x", 100 + (position / sequenceLength) * (restrictionWindowDisplayWidth - 100))
                .attr("y", y)
                .attr("width", tickWidth)
                .attr("height", elementHeight)
                .attr("fill", groupColor)
                .style("cursor", "pointer")
                .on("mouseover", function () {
                    tooltip.text(restrictionSiteName + " (" + position + ")");
                })
                .on("mouseout", function () {
                    tooltip.text("");
                });
    
            var tooltip = svgRestrictionRemoval.append("text")
                .attr("x", 100 + (position / sequenceLength) * (restrictionWindowDisplayWidth - 100))
                .attr("y", y - 5)
                .attr("text-anchor", "middle")
                .style("fill", "black")
                .style("font-size", "12px")
                .style("pointer-events", "none");
        });
    });

    const svgRestrictionRemovalDetails = select(restrictionRemovalDetailsContent)
        .append("svg")
        .style("background-color", "#f0f0f0")
        .attr("width", "100%")
        .attr("height", "100%");

    drawRestrictionRemovalDetails(restrictionSiteNames, restrictionSitesToBeRemoved, svgRestrictionRemovalDetails);
}



function drawRestrictionRemovalDetails(restrictionSiteNamesToBeRemoved, restrictionSitesToBeRemoved, svgRestrictionRemovalDetails) {

    svgRestrictionRemovalDetails.selectAll("*").remove();

    svgRestrictionRemovalDetails.append("text")
        .attr("x", 20)
        .attr("y", 30)
        .style("fill", "black")
        .attr("font-size", "18px")
        .text("Sites To Be Removed");

    var button_x = 30;
    var button_y = 60
    var button_radius = 5;
    var button_width = 200;
    var button_height = 50;
    var button_dark = "#30353f";
    var button_light = "#5da8a3";
    
    var x = 300;
    var y_top = 65;
    var y = y_top;
    var siteNumberIndex = 0;

    if(restrictionSiteNamesToBeRemoved.length === 0) {

        svgRestrictionRemovalDetails.append('rect')
            .attr("x", button_x)
            .attr("y", button_y)
            .attr("rx", button_radius)
            .attr("ry", button_radius)
            .attr("width", button_width)
            .attr("height", button_height)
            .attr("fill", button_dark);

        svgRestrictionRemovalDetails.append("text")
            .attr("x", button_x + 35)
            .attr("y", button_y + 32)
            .style("fill", button_light)
            .attr("font-size", "18px")
            .attr("font-weight", "700")
            .text("SELECT SITES");
    }
    else {

        svgRestrictionRemovalDetails.append('rect')
            .attr("x", button_x)
            .attr("y", button_y)
            .attr("rx", button_radius)
            .attr("ry", button_radius)
            .attr("width", button_width)
            .attr("height", button_height)
            .attr("fill", button_light)
            .style("cursor", "pointer")
            .on("click", function() { bulkRemoveRestrictionSites(restrictionSitesToBeRemoved); })

        svgRestrictionRemovalDetails.append("text")
            .attr("x", button_x + 35)
            .attr("y", button_y + 32)
            .style("fill", button_dark)
            .attr("font-size", "18px")
            .attr("font-weight", "700")
            .text("REMOVE SITES")
            .style("cursor", "pointer")
            .on("click", function() { bulkRemoveRestrictionSites(restrictionSitesToBeRemoved); })
    }

    restrictionSiteNamesToBeRemoved.forEach((restrictionSiteName) => {

        siteNumberIndex++;

        svgRestrictionRemovalDetails.append("text")
            .attr("x", x)
            .attr("y", y)
            .style("fill", "black")
            .attr("font-size", "16px")
            .text(restrictionSiteName);

        if((siteNumberIndex % 3) == 0) {
            x = x + 150;
            y = y_top;
        }
        else {
            y = y + 25;
        }
    });
}



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
        .style("background-color", "#f0f0f0")
        .attr("width", "100%")
        .attr("height", "100%");

    var svgAAAlignment = select(aaAlignmentDiv)
        .append("svg")
        .style("background-color", "#f0f0f0")
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

        // Draw the sequence:
        let displayIndex = 0;
        let aaRect = [];
            
        for (let i = 0; i < currentGroupAASequence.length; i++) {
                
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
                .style("cursor", "pointer")
                .on("click", function() {
                    populateSignatureSequence(signatureWindow, currentGroupDNASequence, currentGroupAASequence[i]['genomeCodonStartPosition'], 'aaSelection', 'aaResults', 'aaSelectionSvg', 'aaResultsSvg', currentGroupAASequence, null);
                });
        
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
    header += "<select id=\"selectRestrictionSite\">";
    header += "<option value=\"\" disabled selected>Select Restriction Site</option>";
    getRestrictionSiteNames().forEach((restrictionSiteName) => {
        header += "<option value=\"" + restrictionSiteName + "\">" + restrictionSiteName + "</option>";
    });
    header += "</select>";
    

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
    tabs += "<button id=\"restrictionRemovalButton\" class=\"tablinks\" style=\"font-weight: bold;\">Restriction Removal</button>";
    tabs += "<button id=\"restrictionDesignButton\" class=\"tablinks\" style=\"font-weight: bold;\">Restriction Design</button>";
    tabs += "<button id=\"restrictionButton\" class=\"tablinks\" style=\"font-weight: bold;\">Restriction Comparison</button>";
    tabs += "<button id=\"aaAlignmentButton\" class=\"tablinks\" style=\"font-weight: bold;\">ORF AA Alignments</button>";
    tabs += "<button id=\"ampliconButton\" class=\"tablinks\" style=\"font-weight: bold;\">Amplicon Selection</button>";
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
            height: 100%;
            margin: 0 auto; /* Center the results div horizontally */
            font-family: Lato, &quot;Helvetica Neue&quot;, Helvetica, sans-serif;
            font-size: 20px;
            letter-spacing: 0.4rem;
            margin-left: 0px;
            margin-top: 0px;
            margin-bottom: 0px;
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
            background: #30353F;
            text-align: right;
            horizontal-align: right;
            float: right;
        }
        .tab button {
            background-color: inherit;
            float: right;
            border: none;
            outline: none;
            cursor: pointer;
            padding: 14px 16px;
            transition: 0.3s;
        }
        .tablinks {
            border-radius: 10px 10px 0 0; /* Rounded corners on top */
        }
        #selectRestrictionSite {
            position: absolute;
            right: 100px; /* Adjust left position */
            top: 150px; /* Adjust top position */
            border-radius: 5px; /* Rounded corners */
            padding: 10px; /* Padding inside the select box */
            border: 1px solid #ccc; /* Border color and width */
            background-color: ##f0f0f0; /* Background color */
            font-size: 14px; /* Font size */
            color: #333; /* Text color */
        }
    `;

    style += "</style>";

    return style;
}
