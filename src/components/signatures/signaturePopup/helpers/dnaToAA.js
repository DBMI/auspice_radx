import { AminoAcid } from "../../aminoAcid";

const geneticCode = {
    'TTT': {'aa': 'F', 'ec': 0.57, 'hs': 0. },
    'TTC': {'aa': 'F', 'ec': 0.43, 'hs': 0. },
    'TTA': {'aa': 'L', 'ec': 0.15, 'hs': 0. },
    'TTG': {'aa': 'L', 'ec': 0.12, 'hs': 0. },
    'CTT': {'aa': 'L', 'ec': 0.12, 'hs': 0. },
    'CTC': {'aa': 'L', 'ec': 0.10, 'hs': 0. },
    'CTA': {'aa': 'L', 'ec': 0.05, 'hs': 0. },
    'CTG': {'aa': 'L', 'ec': 0.46, 'hs': 0. },
    'ATT': {'aa': 'I', 'ec': 0.58, 'hs': 0. },
    'ATC': {'aa': 'I', 'ec': 0.35, 'hs': 0. },
    'ATA': {'aa': 'I', 'ec': 0.07, 'hs': 0. },
    'ATG': {'aa': 'M', 'ec': 1.00, 'hs': 0. },
    'GTT': {'aa': 'V', 'ec': 0.25, 'hs': 0. },
    'GTC': {'aa': 'V', 'ec': 0.18, 'hs': 0. },
    'GTA': {'aa': 'V', 'ec': 0.17, 'hs': 0. },
    'GTG': {'aa': 'V', 'ec': 0.40, 'hs': 0. },
    'TCT': {'aa': 'S', 'ec': 0.11, 'hs': 0. },
    'TCC': {'aa': 'S', 'ec': 0.11, 'hs': 0. },
    'TCA': {'aa': 'S', 'ec': 0.15, 'hs': 0. },
    'TCG': {'aa': 'S', 'ec': 0.16, 'hs': 0. },
    'CCT': {'aa': 'P', 'ec': 0.17, 'hs': 0. },
    'CCC': {'aa': 'P', 'ec': 0.13, 'hs': 0. },
    'CCA': {'aa': 'P', 'ec': 0.14, 'hs': 0. },
    'CCG': {'aa': 'P', 'ec': 0.55, 'hs': 0. },
    'ACT': {'aa': 'T', 'ec': 0.16, 'hs': 0. },
    'ACC': {'aa': 'T', 'ec': 0.47, 'hs': 0. },
    'ACA': {'aa': 'T', 'ec': 0.13, 'hs': 0. },
    'ACG': {'aa': 'T', 'ec': 0.24, 'hs': 0. },
    'GCT': {'aa': 'A', 'ec': 0.11, 'hs': 0. },  
    'GCC': {'aa': 'A', 'ec': 0.31, 'hs': 0. },
    'GCA': {'aa': 'A', 'ec': 0.21, 'hs': 0. },
    'GCG': {'aa': 'A', 'ec': 0.38, 'hs': 0. },
    'TAT': {'aa': 'Y', 'ec': 0.53, 'hs': 0. },
    'TAC': {'aa': 'Y', 'ec': 0.47, 'hs': 0. },
    'TAA': {'aa': '*', 'ec': 0.64, 'hs': 0. },
    'TAG': {'aa': '*', 'ec': 0.00, 'hs': 0. },
    'CAT': {'aa': 'H', 'ec': 0.55, 'hs': 0. },
    'CAC': {'aa': 'H', 'ec': 0.45, 'hs': 0. },
    'CAA': {'aa': 'Q', 'ec': 0.30, 'hs': 0. },
    'CAG': {'aa': 'Q', 'ec': 0.70, 'hs': 0. },
    'AAT': {'aa': 'N', 'ec': 0.47, 'hs': 0. },
    'AAC': {'aa': 'N', 'ec': 0.53, 'hs': 0. },
    'AAA': {'aa': 'K', 'ec': 0.73, 'hs': 0. },
    'AAG': {'aa': 'K', 'ec': 0.27, 'hs': 0. },
    'GAT': {'aa': 'D', 'ec': 0.65, 'hs': 0. },
    'GAC': {'aa': 'D', 'ec': 0.35, 'hs': 0. },
    'GAA': {'aa': 'E', 'ec': 0.70, 'hs': 0. },
    'GAG': {'aa': 'E', 'ec': 0.30, 'hs': 0. },
    'TGT': {'aa': 'C', 'ec': 0.42, 'hs': 0. },
    'TGC': {'aa': 'C', 'ec': 0.58, 'hs': 0. },
    'TGA': {'aa': '*', 'ec': 0.36, 'hs': 0. },
    'TGG': {'aa': 'W', 'ec': 1.00, 'hs': 0. },
    'CGT': {'aa': 'R', 'ec': 0.36, 'hs': 0. },
    'CGC': {'aa': 'R', 'ec': 0.44, 'hs': 0. },
    'CGA': {'aa': 'R', 'ec': 0.07, 'hs': 0. },
    'CGG': {'aa': 'R', 'ec': 0.07, 'hs': 0. },
    'AGT': {'aa': 'S', 'ec': 0.14, 'hs': 0. },
    'AGC': {'aa': 'S', 'ec': 0.33, 'hs': 0. },
    'AGA': {'aa': 'R', 'ec': 0.02, 'hs': 0. },
    'AGG': {'aa': 'R', 'ec': 0.03, 'hs': 0. },
    'GGT': {'aa': 'G', 'ec': 0.29, 'hs': 0. },
    'GGC': {'aa': 'G', 'ec': 0.46, 'hs': 0. },
    'GGA': {'aa': 'G', 'ec': 0.13, 'hs': 0. },
    'GGG': {'aa': 'G', 'ec': 0.12, 'hs': 0. }
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

            /*if(referenceCodon === 'CGG') {
                console.log("REPLACEMENT CODONS", getReplacementCodons(referenceCodon, 'ec', 0.05));
            }*/

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

    return repacementCodons;
}