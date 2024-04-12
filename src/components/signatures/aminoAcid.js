const MUTANT_COLOR = '#E30202'; // Red
const ROOT_COLORS = {
    'A': '#EDEDED',
    'C': '#848482',
    'D': '#98AFC7',
    'E': '#91A3B0',
    'F': '#A9A9A9',
    'G': '#DCDCDC',
    'H': '#808080',
    'I': '#B6B6B4',
    'K': '#D1D0CE',
    'L': '#616D7E',
    'M': '#B2BEB5',
    'N': '#D3D3D3',
    'P': '#6D7B8D',
    'Q': '#BEBEBE',
    'R': '#8A7F8D',
    'S': '#C0C0C0',
    'T': '#ACACAC',
    'V': '#737CA1',
    'W': '#989898',
    'Y': '#928E85',
    '*': '#6082B6'
}
;


export class AminoAcid {

    //location;
    originalAminoAcid;
    mutantAminoAcids;
  

    constructor(originalAminoAcid) {
  
      //this.location = location;
      this.originalAminoAcid = originalAminoAcid;
      this.mutantAminoAcids = new Set();
    }


    addMutantAminoAcid(mutantAminoAcid) {
  
        this.mutantAminoAcids.add(mutantAminoAcid);
    }


    getDisplayAminoAcid() {
        if(this.mutantAminoAcids.size === 0) {
            return this.originalAminoAcid;
        }
        else {
            return [...this.mutantAminoAcids][0];
        }
    }


    getDisplayColor() {
        if(this.mutantAminoAcids.size === 0) {
            return ROOT_COLORS[this.originalAminoAcid];
        }
        else {
            return MUTANT_COLOR;
        }
    }
}