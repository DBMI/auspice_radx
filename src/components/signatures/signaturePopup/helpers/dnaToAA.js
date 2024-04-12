import { AminoAcid } from "../../aminoAcid";


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

    //dnaCodon = dnaCodon.toUpperCase();
    //console.log("CODON", dnaCodon);

    const geneticCode = {
        'TTT': 'F', 'TTC': 'F', 'TTA': 'L', 'TTG': 'L',
        'CTT': 'L', 'CTC': 'L', 'CTA': 'L', 'CTG': 'L',
        'ATT': 'I', 'ATC': 'I', 'ATA': 'I', 'ATG': 'M',
        'GTT': 'V', 'GTC': 'V', 'GTA': 'V', 'GTG': 'V',
        'TCT': 'S', 'TCC': 'S', 'TCA': 'S', 'TCG': 'S',
        'CCT': 'P', 'CCC': 'P', 'CCA': 'P', 'CCG': 'P',
        'ACT': 'T', 'ACC': 'T', 'ACA': 'T', 'ACG': 'T',
        'GCT': 'A', 'GCC': 'A', 'GCA': 'A', 'GCG': 'A',
        'TAT': 'Y', 'TAC': 'Y', 'TAA': '*', 'TAG': '*',
        'CAT': 'H', 'CAC': 'H', 'CAA': 'Q', 'CAG': 'Q',
        'AAT': 'N', 'AAC': 'N', 'AAA': 'K', 'AAG': 'K',
        'GAT': 'D', 'GAC': 'D', 'GAA': 'E', 'GAG': 'E',
        'TGT': 'C', 'TGC': 'C', 'TGA': '*', 'TGG': 'W',
        'CGT': 'R', 'CGC': 'R', 'CGA': 'R', 'CGG': 'R',
        'AGT': 'S', 'AGC': 'S', 'AGA': 'R', 'AGG': 'R',
        'GGT': 'G', 'GGC': 'G', 'GGA': 'G', 'GGG': 'G'
    };

    return geneticCode[dnaCodon];
}