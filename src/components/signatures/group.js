import { Base } from "./base";


export class Group {


    groupKey;
    groupName;
    groupMemberNumber;
    groupMutations;


    constructor(groupKey) {
        this.groupKey = groupKey;
        this.groupName = groupKey.replace("-", " ");
        this.groupMutations = [];
    }


    setMemberNumber(memberNumber) {
        this.memberNumber = memberNumber;
    }

    // I.e. C22488G which is then transformed to a Base object.
    addGroupMutation(mutation) {
        this.groupMutations.push(mutation);
    }


    getGroupKey() {
        return this.groupKey;
    }


    getGroupName() {
        return this.groupName;
    }


    getGroupMemberNumber() {
        return this.groupMemberNumber;
    }


    getGroupMutations() {
        return this.groupMutations;
    }
}


function parsePositionFromMutationString(mutation) {
    return parseInt(mutation.replace(/\D/g,''));
}


function parseReferenceAlleleFromMutationString(mutation) {
    return mutation.charAt(0).toUpperCase();
}


function parseMutantAlleleFromMutationString(mutation) {
    return mutation.charAt(mutation.length -1 ).toUpperCase();
}
