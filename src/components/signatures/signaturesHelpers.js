const PARSE_BY_AUTHOR = 'author';
const PARSE_BY_CITY = 'city';
const PARSE_BY_COUNTRY = 'country';
const PARSE_BY_HOST = 'host';
const PARSE_BY_ORIGINATING_LAB = 'originating_lab';
const PARSE_BY_SAMPLING_DATE = 'num_date';
const PARSE_BY_SUBMITTING_LAB = 'submitting_lab';


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
//function parseMutationsBy(parseBy, inputTree)  {

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
            groupMutations.get(groupKey).push(parsePositionFromMutationString(nodes[node].mutations.mutations.nuc[i]));
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
        mutations.push(parsePositionFromMutationString(nodes[node].mutations.mutations.nuc[i]));
      }
    }
  
    if((nodes[pai].parentArrayIndex != null) && (nodes[pai].arrayIndex != nodes[pai].parentArrayIndex)) {
      injectParentMutations(pai, nodes, mutations);
    }
  
    return [...new Set(mutations)].sort();
}


// Get the groupKey for a particular node.
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
function parsePositionFromMutationString(mutation) {
  return parseInt(mutation.replace(/\D/g,''));
}


  