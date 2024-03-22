#!/usr/local/bin/python3

'''
    Author: Kai Post
    Date 20240319
    Purpose: Parsing restriction enzyme info from two columns (sequence, name) and generating a
    third column as a sequence regular expression.
'''

import csv
import re


baseRegexes = {
    'A': '[Aa]',
    'C': '[Cc]',
    'G': '[Gg]',
    'T': '[TUtu]',
    'U': '[TUtu]',
    'M': '[ACac]',
    'R': '[AGag]',
    'W': '[ATUatu]',
    'S': '[CGcg]',
    'Y': '[CTUctu]',
    'K': '[GTUgtu]',
    'V': '[ACGacg]',
    'H': '[ACTUactu]',
    'D': '[AGTUagtu]',
    'B': '[CGTUcgtu]',
    'N': '[ACGTUacgtu]'
}


#############################################################################
# Generate Sequence Regular Expression
#############################################################################
def generateSequenceRegularExpression(rawSequence):

    rawSequence = re.sub(r'\([^)]*\)', '', rawSequence)
    rawSequence = re.sub('/', '', rawSequence)

    sequenceRegex = ''

    for base in rawSequence:

        if base in baseRegexes:
            sequenceRegex += baseRegexes[base]
        else:
            sequenceRegex += base
    
    return sequenceRegex


#############################################################################
# Main
#############################################################################
def main():

    with open('/Users/k1post/git/auspice_radx/data/NEB.csv', mode='r', encoding='utf-8-sig') as file:

        uniqueBases = set()

        csv_reader = csv.reader(file)
    
        for row in csv_reader:

            sequence = row[0]
            name = row[1]
        
            print(name, sequence, generateSequenceRegularExpression(sequence))


#############################################################################
# Launch Script
#############################################################################
if __name__ == '__main__':
    main()