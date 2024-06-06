// External function to replace a subsequence of a sequence with a replacement sequence in string form.
export const replaceSequence = (fullSequence, targetSequence, replacementSequence) => {

    if(targetSequence.length != replacementSequence.length) {
        console.error("THE TARGET AND REPLACEMENT SEQUENCE ARE NOT OF THE SAME LENGTH");
    }

    for(let i = 0; i < replacementSequence.length; i += 1) {

        const targetBaseChar = targetSequence[i].getDisplayBase();
        const targetBaseLocation = targetSequence[i]['location'];
        const replacementBaseChar = replacementSequence.charAt(i);
        
        if(targetBaseChar !== replacementBaseChar) {
            fullSequence.find(base => base.location == targetBaseLocation).addIntroducedMutantBase(replacementBaseChar);
        }

        //console.log(replacementSequence.charAt(i), targetSequence[i]);
    }

    return fullSequence;
};