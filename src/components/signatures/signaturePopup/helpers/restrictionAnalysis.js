import { retrieveSequence } from "../../signaturesHelpers";
import { replaceSequence, retrieveTargetSequence } from "./sequenceTools";


// Palindromic sequences have a single pattern, non-palindromic ones will have two.
const restrictionSites = {

    // PALINDROMIC (SIX-CUTTERS AND HIGHER)
	"AclI": ["[Aa][Aa][Cc][Gg][TUtu][TUtu]"],
	"AfeI": ["[Aa][Gg][Cc][Gg][Cc][TUtu]"],
	"AflIII": ["[Aa][Cc][AaGg][CcTtUu][Gg][TUtu]"],
	"AgeI-HF®": ["[Aa][Cc][Cc][Gg][Gg][TUtu]"],
	"AleI-v2": ["[Cc][Aa][Cc][AaCcGgTtUu][AaCcGgTtUu][AaCcGgTtUu][AaCcGgTtUu][Gg][TUtu][Gg]"],
	"AseI": ["[Aa][TUtu][TUtu][Aa][Aa][TUtu]"],
	"BglI": ["[Gg][Cc][Cc][AaCcGgTtUu][AaCcGgTtUu][AaCcGgTtUu][AaCcGgTtUu][AaCcGgTtUu][Gg][Gg][Cc]"],
	"BglII": ["[Aa][Gg][Aa][TUtu][Cc][TUtu]"],
	"BssHII": ["[Gg][Cc][Gg][Cc][Gg][Cc]"],
	"EcoNI": ["[Cc][Cc][TUtu][AaCcGgTtUu][AaCcGgTtUu][AaCcGgTtUu][AaCcGgTtUu][AaCcGgTtUu][Aa][Gg][Gg]"],
	"EcoRI-HF®": ["[Gg][Aa][Aa][TUtu][TUtu][Cc]"],
	"EcoRV-HF®": ["[Gg][Aa][TUtu][Aa][TUtu][Cc]"],
	"HindIII-HF®": ["[Aa][Aa][Gg][Cc][TUtu][TUtu]"],
	"MfeI-HF®": ["[Cc][Aa][Aa][TUtu][TUtu][Gg]"],
	"MluI-HF®": ["[Aa][Cc][Gg][Cc][Gg][TUtu]"],
	"NcoI-HF®": ["[Cc][Cc][Aa][TUtu][Gg][Gg]"],
	"NdeI": ["[Cc][Aa][TUtu][Aa][TUtu][Gg]"],
	"NotI-HF®": ["[Gg][Cc][Gg][Gg][Cc][Cc][Gg][Cc]"],
	"NsiI-HF®": ["[Aa][TUtu][Gg][Cc][Aa][TUtu]"],
	"PacI": ["[TUtu][TUtu][Aa][Aa][TUtu][TUtu][Aa][Aa]"],
	"PciI": ["[Aa][Cc][Aa][TUtu][Gg][TUtu]"],
	"PmlI": ["[Cc][Aa][Cc][Gg][TUtu][Gg]"],
	"PvuII-HF®": ["[Cc][Aa][Gg][Cc][TUtu][Gg]"],
	"SacII": ["[Cc][Cc][Gg][Cc][Gg][Gg]"],
	"ScaI-HF®": ["[Aa][Gg][TUtu][Aa][Cc][TUtu]"],
	"SexAI": ["[Aa][Cc][Cc][AaTtUu][Gg][Gg][TUtu]"],
	"SmaI": ["[Cc][Cc][Cc][Gg][Gg][Gg]"],
	"SpeI-HF®": ["[Aa][Cc][TUtu][Aa][Gg][TUtu]"],
	"SspI-HF®": ["[Aa][Aa][TUtu][Aa][TUtu][TUtu]"],
	"StuI": ["[Aa][Gg][Gg][Cc][Cc][TUtu]"],
	"SwaI": ["[Aa][TUtu][TUtu][TUtu][Aa][Aa][Aa][TUtu]"],
    // GOLDEN GATE ENZYMES (NON-PALINDROMIC)
    "BsaI-HF®v2": ["[Gg][Gg][TtUu][Cc][TtUu][Cc]", "[Gg][Aa][Gg][Aa][Cc][Cc]"],
    "BsmBI-v2": ["[Cc][Gg][TUtu][Cc][TUtu][Cc]", "[Gg][Aa][Gg][Aa][Cc][Gg]"],
    "PaqCI": ["[Cc][Aa][Cc][Cc][TtUu][Gg][Cc]", "[Gg][Cc][Aa][Gg][Gg][TtUu][Gg]"]//,
    // TESTING ONLY FOR SEQUENCES PARTIALLY OR COMPLETEL OUTSIDE OF CODNG REGIONS
    //"TEST-CODING": ["[Aa][Cc][Cc][Gg][Gg][TUtu]"],
    //"TEST-5PRIME": ["[Aa][Aa][Cc][TUtu][Aa][Aa][Aa][Aa][TUtu][Gg]"],
    //"TEST-3PRIME": ["[TUtu][Aa][Cc][Aa][Cc][Aa][TUtu][Aa][Aa][Aa][Cc][Gg][Aa][Aa][Cc][TUtu][TUtu][Aa][TUtu][Gg][Gg]"],
    //"TEST-NONCODING": ["[Cc][Aa][TtUu][Aa][Aa][TtUu][Gg][Aa][Aa][Aa][Cc][TtUu][TtUu][Gg][TtUu][Cc][Aa][Cc][Gg][Cc]"]
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

    for(const restrictionPattern of restrictionSites[restrictionSiteName]) {

        const test = new RegExp(restrictionPattern, "g").test(sequence);

        if(test) {
            return true;
        }
    }
    return false;
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
        let groupSequenceObjectArray = retrieveSequence(rootSequence, Object.keys(mutationsMap.get(group[0])));
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


/* ******************************************************************************************************************************************************

RESTRICTION SITE REMOVAL AND RELATED INTERNAL HELPER FUNCTIONS

****************************************************************************************************************************************************** */


export const getRestrictionFrame = (groupDNASequence, restrictionStart, restrictionStop, genomeAnnotations) => {

    const orf = genomeAnnotations.find(
        obj =>
            restrictionStart >= obj.start &&
            restrictionStop <= obj.end);
    
    // SCENARIO 1: Restriction site is completely enclosed by a single ORF.
    if(orf !== undefined && orf !== null) {

        const restrictionLength = restrictionStop - restrictionStart;
        const orfStart = orf['start'] + 1;
        const restrictionFrameOffset = orfStart % 3;
        const restrictionFrameStart = restrictionStart - restrictionFrameOffset;

        let restrictionFrameStop;
        if (restrictionFrameOffset === 0 && restrictionLength % 3 === 0) {
            restrictionFrameStop = restrictionFrameStart + restrictionLength;
        }
        else if (restrictionFrameOffset === 2 && restrictionLength % 3 === 2) {
            restrictionFrameStop = restrictionFrameStart + restrictionLength + (3 - (restrictionLength % 3)) + 3;
        }
        else {
            restrictionFrameStop = restrictionFrameStart + restrictionLength + (3 - (restrictionLength % 3));
        }

        const restrictionFrameSequence = groupDNASequence.slice(restrictionFrameStart, restrictionFrameStop);
        const restrictionFrame = { restrictionRelativeStart: (restrictionStart - restrictionFrameStart) , restrictionFrameSequence: restrictionFrameSequence };

        console.debug("RESTRICTION SITE IN CODING SEQUENCE, " + restrictionStart + " TO " + restrictionStop, restrictionFrame);

        return restrictionFrame;
    }
    else {

        const orf5PrimeOnly = genomeAnnotations.find(
            obj =>
                restrictionStart < obj.start &&
                restrictionStop >= obj.start);
        
        const orf3PrimeOnly = genomeAnnotations.find(
            obj =>
                restrictionStart <= obj.end &&
                restrictionStop > obj.end);

        // SCENARIO 2: Restriction site is completely outside of any ORF.
        if((orf5PrimeOnly === undefined) && (orf3PrimeOnly === undefined)) {

            const codonOffset = (restrictionStop - restrictionStart) % 3;

            // SCENARIO 2.1: Restriction site length is divisible by 3. Return as is.
            if(codonOffset === 0) {

                const restrictionFrameSequence = groupDNASequence.slice(restrictionStart, restrictionStop);
                const restrictionFrame = { restrictionRelativeStart: 0, restrictionFrameSequence: restrictionFrameSequence };
                
                console.debug("RESTRICTION SITE IN NON-CODING SEQUENCE, 0", restrictionFrame);

                return restrictionFrame;
            }
            // SCENARIO 2.2: Restriction site length is one longer than divisible by 3. Return the restriction site with an extra base on each end.
            else if(codonOffset === 1) {
                
                const restrictionFrameSequence = groupDNASequence.slice((restrictionStart - 1), (restrictionStop + 1));
                const restrictionFrame = { restrictionRelativeStart: 1, restrictionFrameSequence: restrictionFrameSequence };
                
                console.debug("RESTRICTION SITE IN NON-CODING SEQUENCE, 1", restrictionFrame);

                return restrictionFrame;
            }
            // SCENARIO 2.3: Restriction site length is two longer than divisible by 3. Return the restriction site with an extra base on the 5' end.
            else {
                
                const restrictionFrameSequence = groupDNASequence.slice((restrictionStart - 1), restrictionStop);
                const restrictionFrame = { restrictionRelativeStart: 1, restrictionFrameSequence: restrictionFrameSequence };
                
                console.debug("RESTRICTION SITE IN NON-CODING SEQUENCE, 2", restrictionFrame);

                return restrictionFrame;
            }
        }
        // SCENARIO 3: Restriction site is inside the 5' of an ORF.
        else if(orf5PrimeOnly !== undefined && orf5PrimeOnly !== null) {

            const overlap = restrictionStop - orf5PrimeOnly.start;

            var restrictionFrameStop;
            if((overlap % 3) === 0) {
                restrictionFrameStop = restrictionStop;
            }
            else if((overlap % 3) === 1) {
                restrictionFrameStop = restrictionStop + 2;
            }
            else {
                restrictionFrameStop = restrictionStop + 1;
            }

            var restrictionFrameStart;
            var restrictionRelativeStart;
            if(((restrictionFrameStop - restrictionStart) % 3) === 0) {
                restrictionFrameStart = restrictionStart;
                restrictionRelativeStart = 0;
            }
            else if(((restrictionFrameStop - restrictionStart) % 3) === 1) {
                restrictionFrameStart = restrictionStart - 2;
                restrictionRelativeStart = 2;
            }
            else {
                restrictionFrameStart = restrictionStart - 1;
                restrictionRelativeStart = 1;
            }

            const restrictionFrameSequence = groupDNASequence.slice(restrictionFrameStart, restrictionFrameStop);
            const restrictionFrame = { restrictionRelativeStart: restrictionRelativeStart, restrictionFrameSequence: restrictionFrameSequence };

            console.debug("RESTRICTION SITE IN PARTIAL CODING SEQUENCE AT 5' END", restrictionFrame);

            return restrictionFrame;
        }
        // SCENARIO 4: Restriction site is inside the 3' of an ORF.
        else {

            const overlap = orf3PrimeOnly.stop - restrictionStart;

            var restrictionFrameStart;
            var restrictionRelativeStart;
            if((overlap % 3) === 0) {
                restrictionFrameStart = restrictionStart;
                restrictionRelativeStart = 0;
            }
            else if((overlap % 3) === 1) {
                restrictionFrameStart = restrictionStart - 2;
                restrictionRelativeStart = 2;
            }
            else {
                restrictionFrameStart = restrictionStart - 1;
                restrictionRelativeStart = 1;
            }

            var restrictionFrameStop;
            if(((restrictionFrameStop - restrictionStart) % 3) === 0) {
                restrictionFrameStop = restrictionStop;
            }
            else if(((restrictionFrameStop - restrictionStart) % 3) === 1) {
                restrictionFrameStop = restrictionStop + 2;
            }
            else {
                restrictionFrameStop = restrictionStop + 1;
            }

            const restrictionFrameSequence = groupDNASequence.slice(restrictionFrameStart, restrictionFrameStop);
            const restrictionFrame = { restrictionRelativeStart: restrictionRelativeStart, restrictionFrameSequence: restrictionFrameSequence };

            console.debug("RESTRICTION SITE IN PARTIAL CODING SEQUENCE AT 3' END", restrictionFrame);

            return restrictionFrame;
        }
    }
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


/* ******************************************************************************************************************************************************

BULK REMOVE RESTRICTION SITES WITH INTERNAL HELPER FUNCTIONS

****************************************************************************************************************************************************** */


// Note: This currently only supports genomes that have all coding sequences in the (+) direction. Support for (-) will need to be added.
export const bulkRemoveRestrictionSites = (restrictionSitesToBeRemoved, dnaSequence, genomeAnnotations) => {

    const restrictionSitesToBeRemovedArray = Array.from(restrictionSitesToBeRemoved);
    restrictionSitesToBeRemovedArray.sort((a, b) => a.startPosition - b.startPosition);

    restrictionSitesToBeRemoved.forEach(function(restrictionSiteToBeRemoved) {

        const restrictionSiteStart = restrictionSiteToBeRemoved.startPosition;
        const restrictionSiteEnd = restrictionSiteToBeRemoved.startPosition + restrictionSiteToBeRemoved.length;

        const orf = genomeAnnotations.find(
            obj =>
                restrictionSiteStart >= obj.start &&
                restrictionSiteEnd <= obj.end);

        if(orf === undefined) {

            const orf5PrimeOnly = genomeAnnotations.find(
                obj =>
                    restrictionSiteStart < obj.start &&
                    restrictionSiteEnd >= obj.start);
    
            const orf3PrimeOnly = genomeAnnotations.find(
                obj =>
                    restrictionSiteStart <= obj.end &&
                    restrictionSiteEnd > obj.end);

            removeRestrictionSiteFromEdgeCases(restrictionSiteToBeRemoved, dnaSequence, orf5PrimeOnly, orf3PrimeOnly);
        }
        else {
            removeRestrictionSiteInCodingRegion(restrictionSiteToBeRemoved, orf, dnaSequence);
        }
    });
}


// Deal with the Edge Cases: Restriction Sites fully or partially outside of ORFs.
function removeRestrictionSiteFromEdgeCases(restrictionSiteToBeRemoved, dnaSequence, orf5PrimeOnly, orf3PrimeOnly) {

    if(orf5PrimeOnly !== undefined) {
        removeRestrictionSiteFrom5PrimeCodingRegion(restrictionSiteToBeRemoved, dnaSequence, orf5PrimeOnly);
    }
    else if(orf3PrimeOnly !== undefined) {
        removeRestrictionSiteFrom3PrimeCodingRegion(restrictionSiteToBeRemoved, dnaSequence, orf3PrimeOnly);
    }
    else {
        removeRestrictionSiteInNonCodingRegion(restrictionSiteToBeRemoved, dnaSequence);
    }
}



// Edge Case 1: The 5' end of the restriction site in question outside of an ORF, but the 3' end is inside of an ORF.
function removeRestrictionSiteFrom5PrimeCodingRegion(restrictionSiteToBeRemoved, dnaSequence, partialOrf) {

    // TODO: This will need to be implemented in the future.
    console.log('PARTIALLY IN CODING REGION 5P ORF', restrictionSiteToBeRemoved, partialOrf);
}



// Edge Case 1: The 3' end of the restriction site in question outside of an ORF, but the 5' end is inside of an ORF.
function removeRestrictionSiteFrom3PrimeCodingRegion(restrictionSiteToBeRemoved, dnaSequence, partialOrf) {

    // TODO: This will need to be implemented in the future.
    console.log('PARTIALLY IN CODING REGION 3P ORF', restrictionSiteToBeRemoved, partialOrf);
}


// Edge Case 3: The restriction site in question is completely outside of any ORF. If this is the case, just incrementally replace the sequence itself without finding the reading frame.
function removeRestrictionSiteInNonCodingRegion(restrictionSiteToBeRemoved, dnaSequence) {

    const targetSequence = retrieveTargetSequence(dnaSequence, restrictionSiteToBeRemoved.startPosition, restrictionSiteToBeRemoved.length);

    var targetSequenceString = '';
    targetSequence.forEach(function(base) {
        targetSequenceString += base.getDisplayBase();
    });

    // Strategy: Swap out A for T, T/U for A, C for G, and G for C one at a time until the restriction pattern is no longer found.
    var replacementSequenceString = '';
    for(var i = 0; i < targetSequenceString.length; i++) {

        const currentChar = targetSequenceString[i];
        var replacementChar = currentChar;
        if(currentChar === 'A') {
            replacementChar = 'T';
        }
        else if(currentChar === 'T') {
            replacementChar = 'A';
        }
        else if(currentChar === 'U') {
            replacementChar = 'A';
        }
        else if(currentChar === 'C') {
            replacementChar = 'G';
        }
        else if(currentChar === 'G') {
            replacementChar = 'C';
        }

        replacementSequenceString = replaceCharAt(targetSequenceString, i, replacementChar);

        if(!hasRestrictionSite(restrictionSiteToBeRemoved.restrictionSiteName, replacementSequenceString)) {
            break;
        }
    }

    console.log('NON-CODING', restrictionSiteToBeRemoved, targetSequence, replacementSequenceString);

    return replaceSequence(dnaSequence, targetSequence, replacementSequenceString);
}



// Non-Edge Cases: The restriction site in question is completely within an ORF.
function removeRestrictionSiteInCodingRegion(restrictionSiteToBeRemoved, orf, dnaSequence) {

    if(orf['strand'] === '+') {
        removeRestrictionSiteInPosStrandCodingRegion(restrictionSiteToBeRemoved, orf, dnaSequence);
    }
    else {
        removeRestrictionSiteInNegStrandCodingRegion(restrictionSiteToBeRemoved, orf, dnaSequence);
    }
}



// Non-Edge Case 1: The restriction site in question is completely within an ORF on the (+) strand.
function removeRestrictionSiteInPosStrandCodingRegion(restrictionSiteToBeRemoved, orf, dnaSequence) {

    console.log('CODING (+)', restrictionSiteToBeRemoved);
}



// Non-Edge Case 2: The restriction site in question is completely within an ORF on the (-) strand.
function removeRestrictionSiteInNegStrandCodingRegion(restrictionSiteToBeRemoved, orf, dnaSequence) {

    // TODO: This is not the case vof Covid-19, but how would with a (-) strand coding region?

    console.log('CODING (-)', restrictionSiteToBeRemoved);
}



function replaceCharAt(str, index, replacement) {
    if (index < 0 || index >= str.length) {
        throw new Error("Index out of range");
    }
    
    return str.substring(0, index) + replacement + str.substring(index + 1);
}
