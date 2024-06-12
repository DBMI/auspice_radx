import { retrieveSequence } from "../../signaturesHelpers";

// Palindromic sequences have a single pattern, non-palindromic ones will have two.
const restrictionSites = {
    AclI: ["[Aa][Aa][Cc][Gg][TUtu][TUtu]"],
    AfeI: ["[Aa][Gg][Cc][Gg][Cc][TUtu]"],
    AgeIHF: ["[Aa][Cc][Cc][Gg][Gg][TUtu]"],
    AluI: ["[Aa][Gg][Cc][TUtu]"],
    BglII: ["[Aa][Gg][Aa][TUtu][Cc][TUtu]"],
    BsalHFv2: ["[Gg][Gg][TtUu][Cc][TtUu][Cc]", "[Gg][Aa][Gg][Aa][Cc][Cc]"],
    BsmBIv2: ["[Cc][Gg][TUtu][Cc][TUtu][Cc]", "[Gg][Aa][Gg][Aa][Cc][Gg]"],
    EcoRI: ["[Gg][Aa][Aa][TUtu][TUtu][Cc]"],
    EcoRV: ["[Gg][Aa][TUtu][Aa][TUtu][Cc]"],
    HindIII: ["[Aa][Aa][Gg][Cc][TUtu][TUtu]"],
    HpaII: ["[Cc][Cc][Gg][Gg]"],
    MluCI: ["[Aa][Aa][TUtu][TUtu]"],
    MluI: ["[Aa][Cc][Gg][Cc][Gg][TUtu]"],
    MseI: ["[TUtu][TUtu][Aa][Aa]"],
    NdeI: ["[Cc][Aa][TUtu][Aa][TUtu][Gg]"],
    PacI: ["[TUtu][TUtu][Aa][Aa][TUtu][TUtu][Aa][Aa]"],
    PaqCI: ["[Cc][Aa][Cc][Cc][TtUu][Gg][Cc]", "[Gg][Cc][Aa][Gg][Gg][TtUu][Gg]"],
    PciI: ["[Aa][Cc][Aa][TUtu][Gg][TUtu]"],
    SacII: ["[Cc][Cc][Gg][Cc][Gg][Gg]"],
    SexAI: ["[Aa][Cc][Cc][ATUatu][Gg][Gg][TUtu]"],
    SmaI: ["[Cc][Cc][Cc][Gg][Gg][Gg]"]
};


export class RestrictionSiteInfo {
    
    constructor(restrictionSiteName, startPosition, displayColor) {
        this.restrictionSiteName = restrictionSiteName;
        this.startPosition = startPosition;
        this.length = (restrictionSites[restrictionSiteName][0].match(/\[/g) || []).length;
        this.displayColor = displayColor;
    }
}

// External function to check if a sequence contains a specific restriction site pattern
export const hasRestrictionSite = (restrictionSiteName, sequence) => {

    var test;

    restrictionSites[restrictionSiteName].forEach(function(restrictionPattern) {
        test = new RegExp(restrictionPattern, "g").test(sequence);
        if(test) {
            return test;
        }
    });

    return test;
};


export const getRestrictionSiteNames = () => {
    return Object.keys(restrictionSites);
};


export const getRestrictionSiteLength = (restrictionSiteName) => {

    return (restrictionSites[restrictionSiteName][0].match(/\[/g) || []).length;
}


export const getRestrictionSites = (restrictionSiteName, rootSequence, group, mutationsMap) => {

    let groupSequenceObjectArray = retrieveSequence(rootSequence, mutationsMap.get(group[0]));
    let groupSequence = "";
    for(var i = 0; i < groupSequenceObjectArray.length; i++) {
        groupSequence += groupSequenceObjectArray[i].getDisplayBase();
    }
    let matches = [];
    restrictionSites[restrictionSiteName].forEach(function(restrictionPattern) {
        const regex = new RegExp(restrictionPattern, "g");
        let match;
        while ((match = regex.exec(groupSequence)) !== null) {
            matches.push(match.index);
        }
    });

    return matches;
}


export const getAllRestrictionSites = (rootSequence, groups, mutationsMap) => {

    const allRestrictionSites = {}; // All restriction sites for all groups.

    groups.forEach((group) => {

        let allGroupRestrictionSites = {};
        let groupSequenceObjectArray = retrieveSequence(rootSequence, mutationsMap.get(group[0]));
        let groupSequence = "";
        for(var i = 0; i < groupSequenceObjectArray.length; i++) {
            groupSequence += groupSequenceObjectArray[i].getDisplayBase();
        }
        for(const restrictionSite in restrictionSites) {
            let matches = [];
            restrictionSites[restrictionSite].forEach(function(restrictionPattern) {
                const regex = new RegExp(restrictionPattern, "g");
                let match;
                while ((match = regex.exec(groupSequence)) !== null) {
                    matches.push(match.index);
                }
            });
            allGroupRestrictionSites[restrictionSite] = Array.from(new Set(matches)).sort((a, b) => a - b);
        }
        allRestrictionSites[group[0]] = allGroupRestrictionSites;
    });

    return allRestrictionSites;
}


export const getNonConservedRestrictionSites = (rootSequence, groups, mutationsMap) => {

    const allRestrictionSites = getAllRestrictionSites(rootSequence, groups, mutationsMap);

    const positionsMap = {};                    // Postions of restriction sites not conserved in all groups.
    const nonConservedRestrictionSites = {};    // Non-conserved restriction site positions, by group.

    // Calculate all restriction sites that are not conserved in all groups.
    for(const restrictionSite in restrictionSites) {
        positionsMap[restrictionSite] = {};
        const positionMap = {};
        let positionCountMap = {};
        // Count occurrences of positions for each group/restrictionSite combination
        for(const group in allRestrictionSites) {
            const positions = allRestrictionSites[group][restrictionSite];
            positions.forEach((position) => {
                if (!positionCountMap[position]) {
                    positionCountMap[position] = 1;
                } else {
                    positionCountMap[position]++;
                }
            });
        }
        // Find non-conserved positions
        for(const position in positionCountMap) {
            if(positionCountMap[position] < groups.length) {
                positionMap[position] = positionCountMap[position];
            }
        }
        positionsMap[restrictionSite] = positionMap;
    }

    // Finally, populate nonConservedRestrictionSites using allRestrictionSites and positionsMap.
    for(const groupKey in allRestrictionSites) {
        if(allRestrictionSites.hasOwnProperty(groupKey)) {

            const groupRestrictionSites = allRestrictionSites[groupKey];
            
            // Ensure that nonConservedRestrictionSites[group] is initialized
            if(!nonConservedRestrictionSites[groupKey]) {
                nonConservedRestrictionSites[groupKey] = {};
            }

            // Iterating over the inner keys (restriction sites) for each group
            for(const restrictionSiteKey in groupRestrictionSites) {
                let groupRestrictionSitePositions = groupRestrictionSites[restrictionSiteKey];
                let positions = [];//positionsMap[restrictionSiteKey];
                for(const position in positionsMap[restrictionSiteKey]) {
                    positions.push(parseInt(position));
                }
                nonConservedRestrictionSites[groupKey][restrictionSiteKey] = groupRestrictionSitePositions.filter(element => positions.includes(element));
            }
        }
    }

    return nonConservedRestrictionSites;
}



export const bulkRemoveRestrictionSites = (restrictionSitesToBeRemoved) => {

    const restrictionSitesToBeRemovedArray = Array.from(restrictionSitesToBeRemoved);
    restrictionSitesToBeRemovedArray.sort((a, b) => a.startPosition - b.startPosition);

    console.log("BULK REMOVE THEESE SITES", restrictionSitesToBeRemovedArray);
} 
