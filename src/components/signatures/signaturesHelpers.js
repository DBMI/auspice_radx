/* Parse mutations from a tree object by a filter like clade, city, etc. */
export const parseMutationsBy = (parseBy, inputTree) => {
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
      // EXCLUDE NODES HERE THAT ARE NOT GENES FIRST
      if(!nodes[node].name.includes("ROOT") && !nodes[node].name.includes("NODE")) {
        //console.log(nodes[node]);
        if(parseBy == 'author') {
          groupKey = nodes[node].author.value;
        }
        else if(parseBy == 'city') {
          groupKey = nodes[node].city.value;
        }
        else if(parseBy == 'country') {
          groupKey = nodes[node].country.value;
        }
        else if(parseBy == 'host') {
          groupKey = nodes[node].host.value;
        }
        else if(parseBy == 'num_date') {
          groupKey = nodes[node].num_date.value;
        }
        else if(parseBy == 'originating_lab') {
          groupKey = nodes[node].originatingLab.value;
        }
        else if(parseBy == 'submitting_lab') {
          groupKey = nodes[node].submittingLab.value;
        }
  
        groupKeys.push(groupKey);
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
  
        if(parseBy == 'author') {
          groupKey = nodes[node].author.value;
        }
        else if(parseBy == 'city') {
          groupKey = nodes[node].city.value;
        }
        else if(parseBy == 'country') {
          groupKey = nodes[node].country.value;
        }
        else if(parseBy == 'host') {
          groupKey = nodes[node].host.value;
        }
        else if(parseBy == 'num_date') {
          groupKey = nodes[node].num_date.value;
        }
        else if(parseBy == 'originating_lab') {
          groupKey = nodes[node].originatingLab.value;
        }
        else if(parseBy == 'submitting_lab') {
          groupKey = nodes[node].submittingLab.value;
        }
  
        if (nodes[node].mutations.mutations.nuc != null) {
          for(let i = 0; i < nodes[node].mutations.mutations.nuc.length; i++) {
            groupMutations.get(groupKey).push(nodes[node].mutations.mutations.nuc[i]);
          }
        }
  
        groupMutations.set(groupKey, injectParentMutations(node, nodes, groupMutations.get(groupKey)));
      }
    }
  
    console.log(groupMutations);
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
  