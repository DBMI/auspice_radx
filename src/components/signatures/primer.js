export class Primer {

    selectedPosition;
    forwardSequence;
    reverseSequence;
    a;
    c;
    g;
    t;
    tm;
    gcPercent;
  
    constructor(fullSequence, selectedPosition, allele, fivePrimeBaseNo, threePrimeBaseNo) {
  
        this.init(fullSequence, selectedPosition, allele, fivePrimeBaseNo, threePrimeBaseNo);
    }


    init(fullSequence, selectedPosition, allele, fivePrimeBaseNo, threePrimeBaseNo) {

        this.setForwardSequence(fullSequence, selectedPosition, allele, fivePrimeBaseNo, threePrimeBaseNo);
        this.setReverseSequence();

        const primerUpperCase = this.forwardSequence.toUpperCase();

        this.selectedPosition = selectedPosition;

        this.a = (primerUpperCase.match(/A/g) || []).length;
        this.c = (primerUpperCase.match(/C/g) || []).length;
        this.g = (primerUpperCase.match(/G/g) || []).length;
        this.t = (primerUpperCase.match(/T/g) || []).length;

        this.setTm();
        this.setGCPercent();
    }



    setForwardSequence(fullSequence, selectedPosition, allele, fivePrimeBaseNo, threePrimeBaseNo) {

        const start = selectedPosition - fivePrimeBaseNo;
        const end = selectedPosition + threePrimeBaseNo;
    
        let forwardSequence = "";
    
        for(let i = start; i <= end; i++) {
            if(i === selectedPosition) {
                forwardSequence += allele;
            }
            else {
                forwardSequence += fullSequence[i].getDisplayBase().toLowerCase();
            }
        }
    
        this.forwardSequence = forwardSequence;
    }


    setReverseSequence() {

        let reverseSequence = "";
        let length = this.forwardSequence.length;

        for(let i = length - 1; i >= 0; i--) {
            reverseSequence += this.getBaseComplement(this.forwardSequence[i]);
        }

        this.reverseSequence = reverseSequence;
    }


    setTm() {

        let primerUpperCase = this.forwardSequence.toUpperCase();
    
        const at = this.a + this.t;
        const cg = this.c + this.g;
    
        // https://www.rosalind.bio/en/knowledge/what-formula-is-used-to-calculate-tm
        this.tm = Math.round(64.9 + (41 * (cg - 16.4) / (at + cg)));
    }


    setGCPercent() {

        this.gcPercent = Math.round(100 * (this.c + this.g) / this.forwardSequence.length);
    }


    getBaseComplement(base) {
        
        if(base === "a") {
            return "t";
        }
        else if(base === "c") {
            return "g";
        }
        else if(base === "g") {
            return "c";
        }
        else if(base === "t") {
            return "a";
        }
        else if(base === "A") {
            return "T";
        }
        else if(base === "C") {
            return "G";
        }
        else if(base === "G") {
            return "C";
        }
        else if(base === "T") {
            return "A";
        }
        else {
            return "X";
        }
    }


    getSelectedPosition() {
        return this.selectedPosition;
    }


    getForwardSequence() {
        return this.forwardSequence;
    }


    getReverseSequence() {
        return this.reverseSequence;
    }


    getTm() {
        return this.tm;
    }

    getGCPercent() {
        return this.gcPercent;
    }

}