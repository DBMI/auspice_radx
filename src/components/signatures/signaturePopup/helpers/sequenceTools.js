// External function to replace a subsequence of a sequence with a replacement sequence in string form.
export const replaceSequence = (fullSequence, targetSequence, replacementSequence) => {

    if(targetSequence.length != replacementSequence.length) {
        console.error("THE TARGET AND REPLACEMENT SEQUENCE ARE NOT OF THE SAME LENGTH");
    }

    for(let i = 0; i < replacementSequence.length; i += 1) {
        console.log(replacementSequence.charAt(i), targetSequence[i]);
    }

    return fullSequence;
};