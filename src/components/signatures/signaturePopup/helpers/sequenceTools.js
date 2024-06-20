/* ******************************************************************************************************************************************************

REPLACE SEQUENCE

fullSequence: The full nucleic acid sequence as an array of Base.
targetSequence: The nucleic acid to be replaced as an array of Base (i.e. sub-array of fullSequence).
replacementSequence: The new nucleic acid sequence to replace the target sequence with as a string.

****************************************************************************************************************************************************** */
export const replaceSequence = (fullSequence, targetSequence, replacementSequence) => {

    if(targetSequence.length != replacementSequence.length) {
        console.error("THE TARGET AND REPLACEMENT SEQUENCE ARE NOT OF THE SAME LENGTH");
    }

    for(let i = 0; i < replacementSequence.length; i += 1) {

        const targetBase = targetSequence[i];
        targetBase.resetIntroducedMutantBases();
        const targetBaseChar = targetBase.getDisplayBase();
        const targetBaseLocation = targetSequence[i]['location'];
        const replacementBaseChar = replacementSequence.charAt(i);

        if(targetBaseChar != replacementBaseChar) {
            fullSequence.find(base => base.location == targetBaseLocation).addIntroducedMutantBase(replacementBaseChar);
        }

        //console.log(replacementSequence.charAt(i), targetSequence[i]);
    }

    return fullSequence;
};


/* ******************************************************************************************************************************************************

RETRIEVE TARGET SEQUENCE

fullSequence: The full nucleic acid sequence as an array of Base.
targetSequenceStart: The start position of the sub-array of fullSequence to be returned as an int.
targetSequenceLength: The length of the sub-array of fullSequence to be returned as an int.

****************************************************************************************************************************************************** */
export const retrieveTargetSequence = (fullSequence, targetSequenceStart, targetSequenceLength) => {

    return fullSequence.slice(targetSequenceStart, targetSequenceStart + targetSequenceLength);
}



// Keep this one around, for some reasons introduced mutations leak into replaceSequence function.
function testSequenceForIntroducedMutations(sequence) {

    sequence.forEach((base) => {
         if(base.containsIntroducedMutations()) {
            return true;
         }
    });

    return false;
}