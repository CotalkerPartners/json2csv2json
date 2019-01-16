"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var parentList = [];
//Check errors
function FormatErrors(row) {
    if (row.includes('..')) {
        throw "Object notation error: Use of \'..\' is not permited. Cause: " + row;
    }
    if ((row.includes('{[') && row.includes(']}')) || (row.includes('.['))) {
        throw "Object notation error: Use of Array \'[]\' is not permited as an object attribute." +
            "Cause: " + row;
    }
    if (row.includes('[[') || row.includes(']]')) {
        throw "Array notation error: Nesting of brackets for Array \'[[]]\' is not permited." +
            "Cause: " + row;
    }
}
function parentIsArray(subrow) {
    let ans;
    let ind;
    if (subrow.slice(-1) === ']') {
        let aux = subrow.slice(subrow.lastIndexOf('[') + 1, -1);
        if (!isNaN(Number(aux))) {
            ind = parseInt(aux);
            ans = true;
        }
        else {
            ans = false;
            ind = -1;
            throw "Array index error. Cause: " + subrow;
        }
    }
    else {
        ans = false;
        ind = -1;
    }
    return { answer: ans, index: ind };
}
function parentIsObject(subrow) {
    let ans;
    let key;
    if (subrow.slice(-1) === '}') {
        let aux = subrow.slice(subrow.lastIndexOf('{') + 1, -1);
        ans = true;
        key = aux;
    }
    else {
        ans = false;
        key = null;
    }
    return { answer: ans, Key: key };
}
function rowClassifier(row, schem) {
    try {
        FormatErrors(row);
    }
    catch (error) {
        console.log(error);
    }
    /*Go across the string from beggining to end, order of instances of '{','[' or '.' determines
     the hierarchy of the row.*/
    let hierarch = [];
    let lvl = 0;
    for (var i = 0, tot = row.length; i < tot; i++) {
        if (row[i] === '[') {
            if (lvl === 0) {
                var previous = row.substring(0, i);
                if (!(previous in schem)) {
                    console.log("Added " + previous + "[] to Schem");
                    schem[previous] = [];
                }
                parentList.push(previous);
                lvl++;
            }
            else {
                let tA;
                let tO;
                previous = row.substring(0, i);
                try {
                    tA = parentIsArray(previous);
                }
                catch (error) {
                    console.log(error);
                }
                if (tA.answer) {
                    hierarch.push({
                        parent: parentList.slice(0, lvl),
                        index: tA.index,
                        level: lvl,
                        isLeaf: false,
                        ptype: 'Array',
                        type: 'Array'
                    });
                    parentList.push(tA.index);
                }
                try {
                    tO = parentIsObject(previous);
                }
                catch (error) {
                    console.log(error);
                }
                if (tO.answer) {
                    hierarch.push({
                        parent: parentList.slice(0, lvl),
                        key: tO.Key,
                        level: lvl,
                        isLeaf: false,
                        ptype: 'Object',
                        type: 'Array'
                    });
                    parentList.push(tO.Key);
                }
                lvl++;
            }
        }
        else if (row[i] === '{') {
            let tA;
            let tO;
            if (lvl === 0) {
                previous = row.substring(0, i);
                if (!(previous in schem)) {
                    schem[previous] = {};
                }
                parentList.push(previous);
                lvl++;
            }
            else {
                previous = row.substring(0, i);
                try {
                    tA = parentIsArray(previous);
                }
                catch (error) {
                    console.log(error);
                }
                if (tA.answer) {
                    hierarch.push({
                        parent: parentList.slice(0, lvl),
                        index: tA.index,
                        level: lvl,
                        isLeaf: false,
                        ptype: 'Array',
                        type: 'Object'
                    });
                    parentList.push(tA.index);
                }
                try {
                    tO = parentIsObject(previous);
                }
                catch (error) {
                    console.log(error);
                }
                if (tO.answer) {
                    hierarch.push({
                        parent: parentList.slice(0, lvl),
                        key: tO.Key,
                        level: lvl,
                        isLeaf: false,
                        ptype: 'Object',
                        type: 'Object'
                    });
                    parentList.push(tO.Key);
                }
                lvl++;
            }
        }
        else if (row[i] === '.') {
        }
    }
    if (lvl === 0) {
        if (!(row in schem)) {
            schem[row] = 'String'; //Schema to String for non nested elements
            console.log('Added ' + row + ' to Schem'); //ConsoleLog
        }
        hierarch.push({
            parent: null,
            index: null,
            level: lvl,
            isLeaf: true,
            ptype: null,
            type: 'String'
        });
    }
    else {
        let tA;
        let tO;
        tA = parentIsArray(row);
        tO = parentIsObject(row);
        if (tA.answer) {
            hierarch.push({
                parent: parentList,
                index: tA.index,
                level: lvl,
                isLeaf: true,
                ptype: 'Array',
                type: 'String'
            });
        }
        else if (tO.answer) {
            hierarch.push({
                parent: parentList,
                key: tO.Key,
                level: lvl,
                isLeaf: true,
                ptype: 'Object',
                type: 'String'
            });
        }
    }
    let maxlvl = lvl - 1;
    hierarch.forEach((node) => {
        if (node.index === maxlvl) {
            node.isLeaf = true;
            node.type = 'String';
        }
    });
    parentList = [];
    return hierarch;
}
exports.rowClassifier = rowClassifier;
;
//# sourceMappingURL=headerClassifier.js.map