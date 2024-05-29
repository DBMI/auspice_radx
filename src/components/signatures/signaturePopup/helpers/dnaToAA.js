import { AminoAcid } from "../../aminoAcid";

const geneticCode = {
    'TTT': {'aa': 'F', 'ec': 0.57, 'hs': 0.47 },    // Frequency of Codon For Given Amino Acid
    'TTC': {'aa': 'F', 'ec': 0.43, 'hs': 0.53 },    // Frequency of Codon For Given Amino Acid
    'TTA': {'aa': 'L', 'ec': 0.15, 'hs': 0.08 },    // Frequency of Codon For Given Amino Acid
    'TTG': {'aa': 'L', 'ec': 0.12, 'hs': 0.13 },    // Frequency of Codon For Given Amino Acid
    'CTT': {'aa': 'L', 'ec': 0.12, 'hs': 0.13 },    // Frequency of Codon For Given Amino Acid
    'CTC': {'aa': 'L', 'ec': 0.10, 'hs': 0.20 },    // Frequency of Codon For Given Amino Acid
    'CTA': {'aa': 'L', 'ec': 0.05, 'hs': 0.07 },    // Frequency of Codon For Given Amino Acid
    'CTG': {'aa': 'L', 'ec': 0.46, 'hs': 0.40 },    // Frequency of Codon For Given Amino Acid
    'ATT': {'aa': 'I', 'ec': 0.58, 'hs': 0.36 },    // Frequency of Codon For Given Amino Acid
    'ATC': {'aa': 'I', 'ec': 0.35, 'hs': 0.48 },    // Frequency of Codon For Given Amino Acid
    'ATA': {'aa': 'I', 'ec': 0.07, 'hs': 0.16 },    // Frequency of Codon For Given Amino Acid
    'ATG': {'aa': 'M', 'ec': 1.00, 'hs': 1.00 },    // Frequency of Codon For Given Amino Acid
    'GTT': {'aa': 'V', 'ec': 0.25, 'hs': 0.18 },    // Frequency of Codon For Given Amino Acid
    'GTC': {'aa': 'V', 'ec': 0.18, 'hs': 0.14 },    // Frequency of Codon For Given Amino Acid
    'GTA': {'aa': 'V', 'ec': 0.17, 'hs': 0.23 },    // Frequency of Codon For Given Amino Acid
    'GTG': {'aa': 'V', 'ec': 0.40, 'hs': 0.46 },    // Frequency of Codon For Given Amino Acid
    'TCT': {'aa': 'S', 'ec': 0.11, 'hs': 0.19 },    // Frequency of Codon For Given Amino Acid
    'TCC': {'aa': 'S', 'ec': 0.11, 'hs': 0.22 },    // Frequency of Codon For Given Amino Acid
    'TCA': {'aa': 'S', 'ec': 0.15, 'hs': 0.15 },    // Frequency of Codon For Given Amino Acid
    'TCG': {'aa': 'S', 'ec': 0.16, 'hs': 0.05 },    // Frequency of Codon For Given Amino Acid
    'CCT': {'aa': 'P', 'ec': 0.17, 'hs': 0.28 },    // Frequency of Codon For Given Amino Acid
    'CCC': {'aa': 'P', 'ec': 0.13, 'hs': 0.33 },    // Frequency of Codon For Given Amino Acid
    'CCA': {'aa': 'P', 'ec': 0.14, 'hs': 0.28 },    // Frequency of Codon For Given Amino Acid
    'CCG': {'aa': 'P', 'ec': 0.55, 'hs': 0.11 },    // Frequency of Codon For Given Amino Acid
    'ACT': {'aa': 'T', 'ec': 0.16, 'hs': 0.25 },    // Frequency of Codon For Given Amino Acid
    'ACC': {'aa': 'T', 'ec': 0.47, 'hs': 0.36 },    // Frequency of Codon For Given Amino Acid
    'ACA': {'aa': 'T', 'ec': 0.13, 'hs': 0.28 },    // Frequency of Codon For Given Amino Acid
    'ACG': {'aa': 'T', 'ec': 0.24, 'hs': 0.11 },    // Frequency of Codon For Given Amino Acid
    'GCT': {'aa': 'A', 'ec': 0.11, 'hs': 0.26 },    // Frequency of Codon For Given Amino Acid 
    'GCC': {'aa': 'A', 'ec': 0.31, 'hs': 0.41 },    // Frequency of Codon For Given Amino Acid
    'GCA': {'aa': 'A', 'ec': 0.21, 'hs': 0.23 },    // Frequency of Codon For Given Amino Acid
    'GCG': {'aa': 'A', 'ec': 0.38, 'hs': 0.10 },    // Frequency of Codon For Given Amino Acid
    'TAT': {'aa': 'Y', 'ec': 0.53, 'hs': 0.44 },    // Frequency of Codon For Given Amino Acid
    'TAC': {'aa': 'Y', 'ec': 0.47, 'hs': 0.56 },    // Frequency of Codon For Given Amino Acid
    'TAA': {'aa': '*', 'ec': 0.64, 'hs': 0.25 },    // Frequency of Codon For Given Amino Acid
    'TAG': {'aa': '*', 'ec': 0.00, 'hs': 0.25 },    // Frequency of Codon For Given Amino Acid
    'CAT': {'aa': 'H', 'ec': 0.55, 'hs': 0.42 },    // Frequency of Codon For Given Amino Acid
    'CAC': {'aa': 'H', 'ec': 0.45, 'hs': 0.58 },    // Frequency of Codon For Given Amino Acid
    'CAA': {'aa': 'Q', 'ec': 0.30, 'hs': 0.26 },    // Frequency of Codon For Given Amino Acid
    'CAG': {'aa': 'Q', 'ec': 0.70, 'hs': 0.74 },    // Frequency of Codon For Given Amino Acid
    'AAT': {'aa': 'N', 'ec': 0.47, 'hs': 0.47 },    // Frequency of Codon For Given Amino Acid
    'AAC': {'aa': 'N', 'ec': 0.53, 'hs': 0.53 },    // Frequency of Codon For Given Amino Acid
    'AAA': {'aa': 'K', 'ec': 0.73, 'hs': 0.43 },    // Frequency of Codon For Given Amino Acid
    'AAG': {'aa': 'K', 'ec': 0.27, 'hs': 0.57 },    // Frequency of Codon For Given Amino Acid
    'GAT': {'aa': 'D', 'ec': 0.65, 'hs': 0.46 },    // Frequency of Codon For Given Amino Acid
    'GAC': {'aa': 'D', 'ec': 0.35, 'hs': 0.54 },    // Frequency of Codon For Given Amino Acid
    'GAA': {'aa': 'E', 'ec': 0.70, 'hs': 0.42 },    // Frequency of Codon For Given Amino Acid
    'GAG': {'aa': 'E', 'ec': 0.30, 'hs': 0.58 },    // Frequency of Codon For Given Amino Acid
    'TGT': {'aa': 'C', 'ec': 0.42, 'hs': 0.46 },    // Frequency of Codon For Given Amino Acid
    'TGC': {'aa': 'C', 'ec': 0.58, 'hs': 0.54 },    // Frequency of Codon For Given Amino Acid
    'TGA': {'aa': '*', 'ec': 0.36, 'hs': 0.50 },    // Frequency of Codon For Given Amino Acid
    'TGG': {'aa': 'W', 'ec': 1.00, 'hs': 1.00 },    // Frequency of Codon For Given Amino Acid
    'CGT': {'aa': 'R', 'ec': 0.36, 'hs': 0.07 },    // Frequency of Codon For Given Amino Acid
    'CGC': {'aa': 'R', 'ec': 0.44, 'hs': 0.18 },    // Frequency of Codon For Given Amino Acid
    'CGA': {'aa': 'R', 'ec': 0.07, 'hs': 0.11 },    // Frequency of Codon For Given Amino Acid
    'CGG': {'aa': 'R', 'ec': 0.07, 'hs': 0.20 },    // Frequency of Codon For Given Amino Acid
    'AGT': {'aa': 'S', 'ec': 0.14, 'hs': 0.15 },    // Frequency of Codon For Given Amino Acid
    'AGC': {'aa': 'S', 'ec': 0.33, 'hs': 0.24 },    // Frequency of Codon For Given Amino Acid
    'AGA': {'aa': 'R', 'ec': 0.02, 'hs': 0.22 },    // Frequency of Codon For Given Amino Acid
    'AGG': {'aa': 'R', 'ec': 0.03, 'hs': 0.22 },    // Frequency of Codon For Given Amino Acid
    'GGT': {'aa': 'G', 'ec': 0.29, 'hs': 0.16 },    // Frequency of Codon For Given Amino Acid
    'GGC': {'aa': 'G', 'ec': 0.46, 'hs': 0.34 },    // Frequency of Codon For Given Amino Acid
    'GGA': {'aa': 'G', 'ec': 0.13, 'hs': 0.25 },    // Frequency of Codon For Given Amino Acid
    'GGG': {'aa': 'G', 'ec': 0.12, 'hs': 0.25 }     // Frequency of Codon For Given Amino Acid
};


export const getAminoAcidSequence = (cds, dnaSequence) => {

    let aminoAcidSequence = [];
    let aminoAcidSequenceIndex = 0;

    if(cds.strand === '+') {
        for (let i = cds.start; i < cds.end; i += 3) {

            let referenceCodon = dnaSequence[i].getReferenceBase();
            referenceCodon = referenceCodon + dnaSequence[i + 1].getReferenceBase();
            referenceCodon = referenceCodon + dnaSequence[i + 2].getReferenceBase();

            let mutantCodon = dnaSequence[i].getDisplayBase();
            mutantCodon = mutantCodon + dnaSequence[i + 1].getDisplayBase();
            mutantCodon = mutantCodon + dnaSequence[i + 2].getDisplayBase();

            aminoAcidSequence[aminoAcidSequenceIndex] = new AminoAcid(translate(referenceCodon));

            if(translate(referenceCodon) != translate(mutantCodon)) {
                aminoAcidSequence[aminoAcidSequenceIndex].addMutantAminoAcid(translate(mutantCodon));
            }

            aminoAcidSequenceIndex++;
        }
    }
    // TODO: Implement for the '-' strand as well.

    return aminoAcidSequence;
}


function translate(dnaCodon) {

    dnaCodon = dnaCodon.toUpperCase();

    return geneticCode[dnaCodon]['aa'];
}


export const getReplacementCodons = (codon, organism, cutoff) => {

    let repacementCodons = Object.keys(geneticCode).filter(key => {
        const codonInfo = geneticCode[key];
        return codonInfo['aa'] === translate(codon) && codonInfo[organism] >= cutoff;
    });

    /*if(repacementCodons.includes(codon)) {
        const index = repacementCodons.indexOf(codon);
        repacementCodons.splice(index, 1);
    }*/

    return orderCodonsBySimilarity(codon, repacementCodons);
}



function getLevenshteinDistance(codon, replacementCodon) {
    var distance = [];
    for (var i = 0; i <= codon.length; i++) {
        distance[i] = [i];
    }
    for (var j = 0; j <= replacementCodon.length; j++) {
        distance[0][j] = j;
    }
    for (var i = 1; i <= codon.length; i++) {
        for (var j = 1; j <= replacementCodon.length; j++) {
            distance[i][j] = Math.min(
                distance[i - 1][j] + 1,
                distance[i][j - 1] + 1,
                distance[i - 1][j - 1] + (codon[i - 1] == replacementCodon[j - 1] ? 0 : 1)
            );
        }
    }

    return distance[codon.length][replacementCodon.length];
}



function orderCodonsBySimilarity(codon, replacementCodons) {
    // Convert strings to uppercase
    codon = codon.toUpperCase();
    replacementCodons = replacementCodons.map(str => str.toUpperCase());

    // Calculate similarity scores for each string in y
    var similarityScores = replacementCodons.map(str => getLevenshteinDistance(codon, str));

    // Create an array of indices and sort it based on similarity scores
    var indices = Array.from(replacementCodons.keys());
    indices.sort((a, b) => similarityScores[a] - similarityScores[b]);

    // Return rearranged replacementCodons based on sorted indices
    return indices.map(index => replacementCodons[index]);
}