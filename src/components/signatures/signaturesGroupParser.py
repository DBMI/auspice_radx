#!/usr/local/bin/python3

'''
    Author: Kai Post
    Date 20240215
    Purpose: Parsing group information out of Augur JSON file for inclusion in Auspice/RADx Singanure JSON files.
'''

import calendar
from datetime import timedelta, datetime
import json
import logging

############################################################################
# Generate the grouping summaries for the data provided.
############################################################################
def generateGroupings(groups):
    
    global groupings

    for group in groups:
        groupingDict = dict(grouping = group)
        currentDict = dict()
        for seqMetaData in sequenceMetaData:
            # Create the groups with totals.
            if(group in seqMetaData):
                item = seqMetaData[group]
            else:
                item = 'MISSING VALUE'
            if(not item in currentDict):
                currentDict[item] = dict(total_sequences = 1)
            else:
                currentDict[item]['total_sequences'] = currentDict[item]['total_sequences'] + 1
            # Add the mutations.
            currentDictItem = currentDict[item]
            mutations = seqMetaData['mutations']
            for mutation in mutations:
                if(not mutation in currentDictItem):
                    currentDictItem[mutation] = 1
                else:
                    currentDictItem[mutation] = currentDictItem[mutation] + 1

        groupingDict['data'] = currentDict
        groupings.append(groupingDict)


############################################################################
# Convert the decimal year format used by Augur/Auspice to datetime,
# including a helper function to retrieve an extra day for leap years.
############################################################################
def getLeapDay(year):

    if calendar.isleap(year):
        return 1
    else:
        return 0


def convertDecimalYearToDate(number):

    year = int(number)
    d = timedelta(days = (number - year) * (365 + getLeapDay(year)))
    day_one = datetime(year, 1, 1)
    date = d + day_one

    return date.date().strftime("%m-%d-%Y")


############################################################################
# Parse Tree With Recursive Parse Branch Function
############################################################################
def parseBranch(branch, parentalMutationsNuc):
    '''
    Recursive helper function for parseTree.
    '''
    global groupNames, sequenceMetaData
    for subBranch in branch['children']:
        name = subBranch['name']
        branchAttrs = subBranch['branch_attrs']
        mutations = branchAttrs['mutations']
        if('nuc' in mutations):
            mutationsNuc = parentalMutationsNuc.union(mutations['nuc'])
        else:
            mutationsNuc = parentalMutationsNuc
        nodeAttrs = subBranch['node_attrs']
        date = convertDecimalYearToDate(nodeAttrs['num_date']['value'])
        branchInfo = dict(name = name, mutations = list(mutationsNuc), date = date)
        for groupName in groupNames:
            if(groupName in nodeAttrs):
                branchInfo[groupName] = nodeAttrs[groupName]['value']
        if(not name.startswith('NODE_')):
            sequenceMetaData.append(branchInfo)
        if('children' in subBranch):
            parseBranch(subBranch, mutationsNuc)


def parseTree(jsonData):
    '''
    Parses the tree into individual sequences with their attributes.
    '''
    global groupNames, sequenceMetaData
    for branch in jsonData['tree']['children']:
        name = branch['name']
        branchAttrs = branch['branch_attrs']
        mutations = branchAttrs['mutations']
        if('nuc' in mutations):
            mutationsNuc = set(mutations['nuc'])
        else:
            mutationsNuc = set()
        nodeAttrs = branch['node_attrs']
        date = convertDecimalYearToDate(nodeAttrs['num_date']['value'])
        branchInfo = dict(name = name, mutations = list(mutationsNuc), date = date)
        for groupName in groupNames:
            if(groupName in nodeAttrs):
                branchInfo[groupName] = nodeAttrs[groupName]['value']
        if(not name.startswith('NODE_')):
            sequenceMetaData.append(branchInfo)
        if('children' in branch):
            parseBranch(branch, mutationsNuc)


############################################################################
# Set Group Names
############################################################################
def setGroupNames(jsonData):
    '''
    Returns an array of group names from the jsonData dictionary.
    '''
    global groupNames
    # Iterating through the json list
    for filter in jsonData['meta']['filters']:
        groupNames.append(filter)


############################################################################
# Run
############################################################################
def run(jsonData):
    '''
    Acts as script orchestrator
    '''

    setGroupNames(jsonData)
    #print(groupNames)

    parseTree(jsonData)
    #for seqData in sequenceMetaData:
        #print(seqData)
    
    generateGroupings(groupNames + ['date'])
    print(groupings)
    

#############################################################################
# Global Vars
#############################################################################
# JSON file path
jsonFilePath = '/Users/k1post/git/auspice_radx/data/ncov_signatures.json'

# Set up a logger
logger = logging.getLogger('GROUP PARSING LOGGER')
logger.setLevel(logging.DEBUG)
fh = logging.FileHandler('group_parsing.log')
fh.setLevel(logging.DEBUG)
ch = logging.StreamHandler()
ch.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
fh.setFormatter(formatter)
ch.setFormatter(formatter)
logger.addHandler(fh)
logger.addHandler(ch)
localdebug = False

# Group Names
groupNames = []

# Sequence Meta Data
sequenceMetaData = []

# Groupings (For JSON)
groupings = []


#############################################################################
# Main
#############################################################################
def main():
    '''
    main() is the entry point when running from the command line
    The job of main() is to parse keyword arguments and set up
    any objects required to call run().
    run() will handle executing the script logic.
    '''
    try:
        jsonFile = open(jsonFilePath)
        run(json.load(jsonFile)) # Pass data as dictionary
        jsonFile.close()  
    except Exception as e:
        logger.error(e)


#############################################################################
# Launch Script
#############################################################################
if __name__ == '__main__':
    main()
