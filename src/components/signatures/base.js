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
const BLUE = '#82EEFD'; //'#1338BE';
const RED = "#E30202";
const GREEN = '#03AC13';

const COLOR_A = "#9A9A9A";
const COLOR_C = "#B5B5B5";
const COLOR_G = "#D0D0D0";
const COLOR_T = "#EDEDED";


export class Base {

    location;
    originalBase;
    mutantBases;  // Mutations that came from the JSON file, as observed in real life.
    introducedMutantBases;  // Artificially introduced by researchers using this application.
  
    constructor(location, originalBase) {
  
      this.location = location;
      this.originalBase = this.verifyBase(originalBase);
      this.mutantBases = new Set();
      this.introducedMutantBases = new Set();
    }
  
    addMutantBase(mutantBase) {
  
      this.mutantBases.add(this.verifyBase(mutantBase));
    }


    addIntroducedMutantBase(introducedMutantBase) {

      this.introducedMutantBases.add(this.verifyBase(introducedMutantBase));
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


    getLocation() {
        return this.location;
    }
  
  
    getReferenceBase() {
  
      return this.originalBase;
    }
  
  
    getMutantBases() {
  
      return this.mutantBases;
    }


    getIntroducedMutantBases() {

      return this.introducedMutantBases;
    }
  
  
    containsMutations = function() {
  
      if(this.mutantBases.size == 0) {
        return false;
      }
  
      return true;
    }


    containsIntroducedMutations = function() {
  
      if(this.introducedMutantBases.size == 0) {
        return false;
      }
  
      return true;
    }
  
  
    getDisplayColor = function() {
  
      if(this.introducedMutantBases.size > 0) {
        return BLUE;
      }
      else if(this.mutantBases.size > 0) {
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


    containsMutations = function() {
      if(this.mutantBases.size === 0) {
        return false;
      }
      else {
        return true;
      }
    }
  
  
    getDisplayBase = function() {
  
      // If there is an introduced mutant variety return it for this location. There should only be one despite its array nature.
      if(this.introducedMutantBases.size > 0) {
        return [...this.introducedMutantBases][0];
      }
      // If there are no mutant varieties return the original base for this location.
      else if(this.mutantBases.size === 0) {
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
