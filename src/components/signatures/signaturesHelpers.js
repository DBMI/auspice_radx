

const PARSE_BY_AUTHOR = 'author';
const PARSE_BY_CITY = 'city';
const PARSE_BY_COUNTRY = 'country';
const PARSE_BY_HOST = 'host';
const PARSE_BY_ORIGINATING_LAB = 'originating_lab';
const PARSE_BY_SAMPLING_DATE = 'num_date';
const PARSE_BY_SUBMITTING_LAB = 'submitting_lab';

const BASE_A = "A";
const BASE_C = "C";
const BASE_G = "G";
const BASE_T = "T";
const BASE_U = "U";

const BASE_AMBIG_AC = "M";
const BASE_AMBIG_AG = "R";
const BASE_AMBIG_AT = "W";
const BASE_AMBIG_CG = "S";
const BASE_AMBIG_CT = "Y";
const BASE_AMBIG_GT = "K";
const BASE_AMBIG_ACG = "V";
const BASE_AMBIG_ACT = "H";
const BASE_AMBIG_AGT = "D";
const BASE_AMBIG_CGT = "B";
const BASE_AMBIG_ACGT = "N";

const VALID_BASES = new Set([BASE_A, BASE_C, BASE_G, BASE_T]);

const BLACK = "#000000";
const WHITE = "#FFFFFF";
const RED = "#E30202";

const COLOR_A = "#9A9A9A";
const COLOR_C = "#B5B5B5";
const COLOR_G = "#D0D0D0";
const COLOR_T = "#EDEDED";

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
      groupMutations.set(groupKeys[i], []);
    }
  
  /*
    Populate the mutations arrays in the groupMutations Map. First, with the non-node sequences themselves.
  */
  for(var node in nodes) {
    if(!nodes[node].name.includes("ROOT") && !nodes[node].name.includes("NODE")) {
  
      groupKey = getGroupKey(node, nodes, parseBy);

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
  var reminder = decimalDate - year;
  var daysPerYear = isLeapYear(year) ? 366 : 365;
  var miliseconds = reminder * daysPerYear * 24 * 60 * 60 * 1000;
  var yearDate = new Date(year, 0, 1);
  return new Date(yearDate).toLocaleDateString('en-us', { year:"numeric", month:"short", day:"numeric"});
}


// Converts 'A21137G' to 21137
export const parsePositionFromMutationString = (mutation) => {
  return parseInt(mutation.replace(/\D/g,''));
}

/* Draws mutations from a single grouping as a single line of ticks. */
export const drawGroupMutationsAsTicks = (barBuffer, barHeight, categoryElementColor, currentMutations, geneLength, groupIndex, offsets, scales, selection, zoomCoordinates, sequenceDisplayMax, signaturesChart) => {

  var displayBufferSequenceLength = Math.round(sequenceDisplayMax / 2) - 1; // The number of bases on either side of a mutation to show to change to full sequence view.

  for(let i = 0; i < currentMutations.length; i++) {
    let xPosition = getZoomXPosition(parsePositionFromMutationString(currentMutations[i]), zoomCoordinates[0], zoomCoordinates[1], geneLength);
    if(xPosition !== -1) {
      //signaturesChart.updateSignaturesWithNewZoomMinMax((xPosition - displayBufferSequenceLength), (xPosition + displayBufferSequenceLength));
      selection.append("rect")
        .attr("x", scales.xNav(xPosition))
        .attr("y", offsets.y1Signatures + ((groupIndex + 1) * barHeight) + ((groupIndex + 1) * barBuffer))
        .attr("width", 2.5)
        .attr("height", barHeight)
        .attr("fill", categoryElementColor)
        .on("click", function() { signaturesChart.updateSignaturesWithNewZoomMinMax((xPosition - displayBufferSequenceLength), (xPosition + displayBufferSequenceLength)); })
        //.on("click", function() { signaturesChart._zoom((xPosition - displayBufferSequenceLength), (xPosition + displayBufferSequenceLength)); })
        .enter();
    }
  }
}

/* Draws the sequence for a single grouping as a row of base-labeled squares. */
export const drawGroupSequence = (barBuffer, barHeight, categoryElementColor, currentSequence, geneLength, groupIndex, offsets, scales, selection, zoomCoordinates) => {

  for(let i = 0; i < currentSequence.length; i++) {

    let xPosition = getZoomXPosition(i, zoomCoordinates[0], zoomCoordinates[1], geneLength);
    
    if(xPosition !== -1) {

      let boxDisplayColor = categoryElementColor;
      let fontDisplayColor = BLACK;

      selection.append("rect")
        .attr("x", scales.xNav(xPosition))
        .attr("y", offsets.y1Signatures + ((groupIndex + 1) * barHeight) + ((groupIndex + 1) * barBuffer))
        .attr("width", barHeight)
        .attr("height", barHeight)
        .attr("fill", currentSequence[i].getDisplayColor())
        .enter();

      selection.append("text")
        .attr("x", scales.xNav(xPosition)+ (barHeight / 4))
        .attr("y", offsets.y1Signatures +  ((groupIndex + 1) * barHeight) + ((groupIndex + 1) * barBuffer) + (barHeight / 2))
        .style("fill", fontDisplayColor)
        .attr("dy", ".4em")
        .attr("font-size", "12px")
        .attr("text-align", "left")
        .text(currentSequence[i].getDisplayBase())
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


export class Base {

  location;
  originalBase;
  mutantBases;

  constructor(location, originalBase) {

    this.location = location;
    this.originalBase = this.verifyBase(originalBase);
    this.mutantBases = new Set();
  }

  addMutantBase(mutantBase) {

    this.mutantBases.add(this.verifyBase(mutantBase));
  }

  // How to implement this is still in discussion. For now let's just print an error message to the console.
  verifyBase = function(base) {

    base = base.toUpperCase();

    if(base === BASE_U) {
      base = BASE_T;
    }

    if(!(VALID_BASES.has(base))) {
      console.error("INVALID BASE", base);
    }

    return base;
  }


  hasMutation = function() {

    if(this.mutantBases.size === 0) {
      return false;
    }

    return true;
  }


  getDisplayColor = function() {

    if(this.mutantBases.size > 0) {
      return RED;
    }
    else if(this.originalBase === BASE_A) {
      return COLOR_A;
    }
    else if(this.originalBase === BASE_C) {
      return COLOR_C;
    }
    else if(this.originalBase === BASE_G) {
      return COLOR_G;
    }
    else if(this.originalBase === BASE_T) {
      return COLOR_T;
    }
  }



  getDisplayBase = function() {

    // If there are no mutant varieties return the original base for this location.
    if(this.mutantBases.size === 0) {
      return this.originalBase;
    }
    // If there is only one mutant variety return it for this location.
    else if(this.mutantBases.size === 1) {
      return [...this.mutantBases][0];
    }
    // If there are different varieties at this location return the respictive ambigous base representing the respective combination.
    else if(this.mutantBases.size === 2) {
      if(this.mutantBases.has(BASE_A)) {
        // A or C => M
        if(this.mutantBases.has(BASE_C)) {
          return BASE_AMBIG_AC;
        }
        // A or G => R
        else if(this.mutantBases.has(BASE_G)) {
          return BASE_AMBIG_AG;
        }
        // A or T => W
        else {
          return BASE_AMBIG_AT;
        }
      }
      else if(this.mutantBases.has(BASE_C)) {
        // C or G => S
        if(this.mutantBases.has(BASE_G)) {
          return BASE_AMBIG_CG;
        }
        // C or T => Y
        else {
          return BASE_AMBIG_CT;
        }
      }
      // G or T => K
      else {
        return BASE_AMBIG_GT;
      }
    }
    else if(this.mutantBases.size === 3) {
      if(this.mutantBases.has(BASE_A)) {
        // A, C or G => V
        if(this.mutantBases.has(BASE_C) && this.mutantBases.has(BASE_G)) {
          return BASE_AMBIG_ACG;
        }
        // A, C or T => H
        else {
          return BASE_AMBIG_ACT;
        }
      } 
      // C, G or T => B
      else {
        return BASE_AMBIG_CGT;
      }
    }
    // A, C, T or G => N
    else {
      return BASE_AMBIG_ACGT;
    }
  }
}
  