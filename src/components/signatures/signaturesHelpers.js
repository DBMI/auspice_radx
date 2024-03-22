import { Base } from "./base";
import { displaySignatureWindow, generateSignatureWindowContent, populateSignatureSequence } from "./signaturePopup/signatureWindow";
//import { displayPrimerWindow, generatePrimerWindowContent } from "./primerPopup/primerWindow";

const PARSE_BY_AUTHOR = 'author';
const PARSE_BY_CITY = 'city';
const PARSE_BY_COUNTRY = 'country';
const PARSE_BY_HOST = 'host';
const PARSE_BY_ORIGINATING_LAB = 'originating_lab';
const PARSE_BY_SAMPLING_DATE = 'num_date';
const PARSE_BY_SUBMITTING_LAB = 'submitting_lab';

const BLACK = "#000000";
const WHITE = "#FFFFFF";
const RED = "#E30202";

export const REFERENCE_COLOR = '#808080';


// Translates the position of a nucleotide to the zoome in map.
export const getZoomXPosition = (xPosition, zoomMin, zoomMax, geneLength) => {

  if(zoomMax > geneLength) {
    zoomMax = geneLength;
  }

  let zoomXPosition = Math.round((xPosition + 1 - zoomMin) * (geneLength / (zoomMax - zoomMin)));

  if((zoomXPosition >= 0) && (zoomXPosition <= geneLength)) {
    return zoomXPosition;
  }
  else {
    return -1;
  }
}

export const formatGroupByName = (groupByNameIn) => {

  let groupByNameOut = "";
  let groupByNameElements = groupByNameIn.split("_");

  for(let i = 0; i < groupByNameElements.length; i++) {
    groupByNameOut = groupByNameOut.concat(groupByNameElements[i].charAt(0).toUpperCase());
    groupByNameOut = groupByNameOut.concat(groupByNameElements[i].slice(1));
    if((i + 1) < groupByNameElements.length) {
      groupByNameOut = groupByNameOut.concat(" ");
    }
  }

  return groupByNameOut;
}

/* Parse colorings for a group by the colorBy parameter. */
export const parseGroupColoringsBy = (parseBy, inputTree, nodeColors) => {

  const nodes = [];
  let groupColorings = new Map();

  for (var branch in inputTree) {
    nodes[inputTree[branch].arrayIdx] = {
      arrayIndex: inputTree[branch].arrayIdx,
      name: inputTree[branch].name,
      hasChildren: inputTree[branch].hasChildren,
      parentArrayIndex: inputTree[branch].parent.arrayIdx,
      mutations: inputTree[branch].branch_attrs,
      author: inputTree[branch].node_attrs.author,
      city: inputTree[branch].node_attrs.city,
      country: inputTree[branch].node_attrs.country,
      host: inputTree[branch].node_attrs.host,
      originatingLab: inputTree[branch].node_attrs.originating_lab,
      submittingLab: inputTree[branch].node_attrs.submitting_lab,
      num_date: inputTree[branch].node_attrs.num_date
    };
  }

  for(var node in nodes) {
    // Exclude non-gene nodes first.
    if(!nodes[node].name.includes("ROOT") && !nodes[node].name.includes("NODE")) {
      if(!groupColorings.has()) {
        groupColorings.set(getGroupKey(node, nodes, parseBy), nodeColors[node]);
      }
    }
  }

  return Array.from(groupColorings, ([name, value]) => ([name, value])); // Convert to array of arrays.
}


/* Parse mutations from a tree object by a filter like clade, city, etc. */
export const parseCombinedMutationsBy = (parseBy, inputTree) => {

  let groupSizes = new Map();

  const nodes = [];
  let groupKey;
  let groupKeys = [];
  let groupMutations = new Map();
  
  for (var branch in inputTree) {
    nodes[inputTree[branch].arrayIdx] = {
      arrayIndex: inputTree[branch].arrayIdx,
      name: inputTree[branch].name,
      hasChildren: inputTree[branch].hasChildren,
      parentArrayIndex: inputTree[branch].parent.arrayIdx,
      mutations: inputTree[branch].branch_attrs,
      author: inputTree[branch].node_attrs.author,
      city: inputTree[branch].node_attrs.city,
      country: inputTree[branch].node_attrs.country,
      host: inputTree[branch].node_attrs.host,
      originatingLab: inputTree[branch].node_attrs.originating_lab,
      submittingLab: inputTree[branch].node_attrs.submitting_lab,
      num_date: inputTree[branch].node_attrs.num_date
    };
  }
    
  /*
    Iterate over elements. If the name does not contain 'ROOT' or 'NODE' place in new array keyed on the 'parseBy' value.
  */
  for(var node in nodes) {
    // Exclude non-gene nodes first.
    if(!nodes[node].name.includes("ROOT") && !nodes[node].name.includes("NODE")) {
      groupKeys.push(getGroupKey(node, nodes, parseBy));
    }
  }
  groupKeys = [...new Set(groupKeys)].sort(); // Make array elements unique.
    
    // Initialize the groupMutations Map.
    for(var i = 0; i < groupKeys.length; i++) {
      groupSizes.set(groupKeys[i], 0);
      groupMutations.set(groupKeys[i], []);
    }
  
  /*
    Populate the mutations arrays in the groupMutations Map. First, with the non-node sequences themselves.
  */
  for(var node in nodes) {
    if(!nodes[node].name.includes("ROOT") && !nodes[node].name.includes("NODE")) {
  
      groupKey = getGroupKey(node, nodes, parseBy);
      
      groupSizes.set(groupKey, groupSizes.get(groupKey) + 1);

      if (nodes[node].mutations.mutations.nuc != null) {
        for(let i = 0; i < nodes[node].mutations.mutations.nuc.length; i++) {
          groupMutations.get(groupKey).push(nodes[node].mutations.mutations.nuc[i]);
        }
      }
  
      groupMutations.set(groupKey, injectParentMutations(node, nodes, groupMutations.get(groupKey)));
    }
  }

  return groupMutations;
}
  

// Use this code to recursively fill mutations from parent(s).
function injectParentMutations(node, nodes, mutations) {
  
  let pai = nodes[node].parentArrayIndex;
  
  if (nodes[node].mutations.mutations.nuc != null) {
    for(let i = 0; i < nodes[node].mutations.mutations.nuc.length; i++) {
      mutations.push(nodes[node].mutations.mutations.nuc[i]);
    }
  }
  
  if((nodes[pai].parentArrayIndex != null) && (nodes[pai].arrayIndex != nodes[pai].parentArrayIndex)) {
    injectParentMutations(pai, nodes, mutations);
  }
  
  return [...new Set(mutations)].sort();
}


// Get the groupName for a particular node.
function getGroupName(node, nodes, parseBy) {

  let groupName = 'UNDEFINED';

  if(parseBy == PARSE_BY_AUTHOR) {
    if(nodes[node].author != null) {
      groupName = nodes[node].author.value;
    }
  }
  else if(parseBy == PARSE_BY_CITY) {
    if(nodes[node].city != null) {
      groupName = nodes[node].city.value;
    } 
  }
  else if(parseBy == PARSE_BY_COUNTRY) {
    if(nodes[node].country != null) {
      groupName = nodes[node].country.value;
      }
  }
  else if(parseBy == PARSE_BY_HOST) {
    if (nodes[node].host != null) {
          groupName = nodes[node].host.value;
      }
  }
  else if(parseBy == PARSE_BY_ORIGINATING_LAB) {
    if(nodes[node].originatingLab != null) {
      groupName = nodes[node].originatingLab.value;
    }
  }
  else if(parseBy == PARSE_BY_SAMPLING_DATE) {
    if(nodes[node].num_date != null) {
      groupName = nodes[node].num_date.value;
      console.log("GROUP NAME", groupName);
    }
  }
  else if(parseBy == PARSE_BY_SUBMITTING_LAB) {
    if(nodes[node].submittingLab != null) {
      groupName = nodes[node].submittingLab.value;
    }
  }

  if(typeof  groupName == 'number') {
    groupName = convertDecimalDate(groupName);
  }

  return groupName;
}


// Get the groupKey for a particular node. This is the groupName with illegal characters removed.
function getGroupKey(node, nodes, parseBy) {

  let groupKey = getGroupName(node, nodes, parseBy);

  groupKey = groupKey.replaceAll("&","and");
  groupKey = groupKey.replaceAll("(","");
  groupKey = groupKey.replaceAll(")","");
  groupKey = groupKey.replaceAll(",","");
  groupKey = groupKey.replaceAll(";","-");
  groupKey = groupKey.replaceAll(" ","-");
  groupKey = groupKey.replaceAll("--","-");

  return groupKey;
}


function isLeapYear(year) {
  return ((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0);
}


function convertDecimalDate(decimalDate) {

  var year = parseInt(decimalDate);
  var remainder = decimalDate - year;
  var daysPerYear = isLeapYear(year) ? 366 : 365;
  var days = remainder * daysPerYear; // * 24 * 60 * 60 * 1000;
  var monthIndex;
  var day;

  if(isLeapYear(year)) {    // Leap Year
    if(days <= 31) {        // January
      monthIndex = 0;
      day = days;
    }
    else if(days <= 60) {   // February 
      monthIndex = 1;
      day = days - 31;
    }
    else if(days <= 91) {   // March
      monthIndex = 2;
      day = days - 60;
    }
    else if(days <= 121) {   // April
      monthIndex = 3;
      day = days - 91;
    }
    else if(days <= 152) {    // May
      monthIndex = 4;
      day = days - 121;
    }
    else if(days <= 182) {    // June
      monthIndex = 5;
      day = days - 152;
    }
    else if(days <= 213) {    // July
      monthIndex = 6;
      day = days - 182;
    }
    else if(days <= 244) {    // August
      monthIndex = 7;
      day = days - 213;
    }
    else if(days <= 274) {    // September
      monthIndex = 8;
      day = days - 244;
    }
    else if(days <= 305) {    // October
      monthIndex = 9;
      day = days - 274;
    }
    else if(days <= 335) {    // November
      monthIndex = 10;
      day = days - 305;
    }
    else if(days <= 366) {    // December
      monthIndex = 11;
      day = days - 335;
    }
  }
  else {                    // Non-Leap Year
    if(days <= 31) {        // January
      monthIndex = 0;
      day = days;
    }
    else if(days <= 59) {   // February
      monthIndex = 1;
      day = days - 31;
    }
    else if(days <= 90) {   // March
      monthIndex = 2;
      day = days - 59;
    }
    else if(days <= 120) {   // April
      monthIndex = 3;
      day = days - 90;
    }
    else if(days <= 151) {    // May
      monthIndex = 4;
      day = days - 120;
    }
    else if(days <= 181) {    // June
      monthIndex = 5;
      day = days - 151;
    }
    else if(days <= 212) {    // July
      monthIndex = 6;
      day = days - 181;
    }
    else if(days <= 243) {    // August
      monthIndex = 7;
      day = days - 212;
    }
    else if(days <= 273) {    // September
      monthIndex = 8;
      day = days - 243;
    }
    else if(days <= 304) {    // October
      monthIndex = 9;
      day = days - 273;
    }
    else if(days <= 334) {    // November
      monthIndex = 10;
      day = days - 304;
    }
    else if(days <= 365) {    // December
      monthIndex = 11;
      day = days - 334;
    }
  }
  
  var yearDate = new Date(year, monthIndex, day);
  return new Date(yearDate).toLocaleDateString('en-us', { year:"numeric", month:"short", day:"numeric"});
}


// Converts 'A21137G' to 21137
export const parsePositionFromMutationString = (mutation) => {
  return parseInt(mutation.replace(/\D/g,''));
}

/* Draws mutations from a single grouping as a single line of ticks. */
export const drawGroupMutationsAsTicks = (barBuffer, barHeight, categoryElementColor, currentMutations, geneLength, groupIndex, yMSA, scales, selection, zoomCoordinates, sequenceDisplayMax, signaturesChart) => {

  var displayBufferSequenceLength = Math.round(sequenceDisplayMax / 2) - 1; // The number of bases on either side of a mutation to show to change to full sequence view.

  for(let i = 0; i < currentMutations.length; i++) {
    let xPosition = getZoomXPosition(parsePositionFromMutationString(currentMutations[i]), zoomCoordinates[0], zoomCoordinates[1], geneLength);
    if(xPosition !== -1) {
      //signaturesChart.updateSignaturesWithNewZoomMinMax((xPosition - displayBufferSequenceLength), (xPosition + displayBufferSequenceLength));
      selection.append("rect")
        .attr("x", scales.xNav(xPosition))
        .attr("y", yMSA + ((groupIndex + 1) * barHeight) + ((groupIndex + 1) * barBuffer))
        .attr("width", 2.5)
        .attr("height", barHeight)
        .attr("fill", categoryElementColor)
        .style("cursor", "pointer")
        .on("click", function() { signaturesChart.updateSignaturesWithNewZoomMinMax((xPosition - displayBufferSequenceLength), (xPosition + displayBufferSequenceLength)); })
        .enter();
    }
  }
}

/* Draws the sequence for a single grouping as a row of base-labeled squares. */
export const drawGroupSequence = (barBuffer, barHeight, categoryElementColor, currentSequence, geneLength, groupIndex, yMSA, scales, selection, zoomCoordinates, group, groupCategory) => {

  for(let i = 0; i < currentSequence.length; i++) {

    let xPosition = getZoomXPosition(i, zoomCoordinates[0], zoomCoordinates[1], geneLength);
    
    if(xPosition !== -1) {

      //let boxDisplayColor = categoryElementColor;
      let fontDisplayColor = BLACK;

      selection.append("rect")
        .attr("x", scales.xNav(xPosition))
        .attr("y", yMSA + ((groupIndex + 1) * barHeight) + ((groupIndex + 1) * barBuffer))
        .attr("width", barHeight)
        .attr("height", barHeight)
        .attr("fill", currentSequence[i].getDisplayColor())
        .enter();

      selection.append("text")
        .attr("x", scales.xNav(xPosition)+ (barHeight / 4))
        .attr("y", yMSA +  ((groupIndex + 1) * barHeight) + ((groupIndex + 1) * barBuffer) + (barHeight / 2))
        .style("fill", fontDisplayColor)
        .attr("dy", ".4em")
        .attr("font-size", "12px")
        .attr("text-align", "left")
        .text(currentSequence[i].getDisplayBase())
        .style("cursor", "pointer")
        .on("click", function() {
          const signatureWindow = displaySignatureWindow();
          signatureWindow.document.body.innerHTML = generateSignatureWindowContent(groupCategory, group, i);
          populateSignatureSequence(signatureWindow, currentSequence, i);
        })
        /*.on("click", function() { 
          
          const primerWindow = displayPrimerWindow();
          primerWindow.document.body.innerHTML = generatePrimerWindowContent(group, currentSequence, i);
          
          const primerTypeSelect = primerWindow.document.getElementById("selectPrimerTypes");
          
          primerTypeSelect.addEventListener("change", function(evt) {
            
            const selectBox = evt.currentTarget;
            const options = selectBox.options;
            const selectedIndex = selectBox.selectedIndex;

            for(let i = 0; i < options.length; i++) {
              if(i === selectedIndex) {
                primerWindow.document.getElementById(options[i].value).style.display = "block";
              }
              else {
                primerWindow.document.getElementById(options[i].value).style.display = "none";
              }
            }
          });

          const primerDownloadButton = primerWindow.document.getElementById("downloadPrimersButton");

          primerDownloadButton.addEventListener("click", async function(event) {

            const checkboxes = primerWindow.document.querySelectorAll('input[type=checkbox]:checked')

            if(checkboxes.length > 0) {

              primerWindow.document.getElementById("warningMessages").style.display = 'none';

              var text = "";

              for(let i = 0; i < checkboxes.length; i++) {
  
                const baseHeader = checkboxes[i].id;
                const fwdHeader = ">" + baseHeader + "|FWDSEQ";
                const revHeader = ">" + baseHeader + "|REVSEQ";
                const dataElements = checkboxes[i].value.split("|");
                const fwdSeq = dataElements[1];
                const revSeq = dataElements[3];
                
                text += fwdHeader + "\n";
                text += fwdSeq + "\n";
                text += revHeader + "\n";
                text += revSeq + "\n";
              }
  
              const suggestedFileName = group.replaceAll(" ","-") + "-" + i + ".fna";
  
              const opts = {
                description: 'Primers: ' + suggestedFileName,
                suggestedName: suggestedFileName,
                types: [{
                  accept: {'text/plain': ['.fna', '.txt']},
                }],
              };
              const handle = await primerWindow.showSaveFilePicker(opts);
              const writable = await handle.createWritable();
              await writable.write(new Blob([text], { type: 'text/plain' }));
              await writable.close();
  
              primerWindow.close();
            }
            else {
              primerWindow.document.getElementById("warningMessages").style.display = 'block';
            }
          }, false);
        })*/
        .append("title")
        .text(function() {
          return i;
        })
        .enter();
    }
  }
}


// Takes reference sequence as a string, applies mutations to it, if applicable and returns it as an array of Base.
export const retrieveSequence = (referenceSequence, mutations) => {

  let sequenceAsChars = [...referenceSequence];
  let sequence = new Array(sequenceAsChars.length);

  for(let i = 0; i < sequenceAsChars.length; i++) {
    sequence[i] = new Base(i, sequenceAsChars[i]);
  }

  if(mutations.length > 0) {
    for(let i = 0; i < mutations.length; i++) {
      let newBase = mutations[i].slice(-1);
      let position = parsePositionFromMutationString(mutations[i]) - 1;
      sequence[position].addMutantBase(newBase);
    }
  }
    
  return sequence;
}
