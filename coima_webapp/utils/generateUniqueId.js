'use strict'

function eliminateDuplicates(arr) {
    let i
    let len = arr.length
    let out = []
    let obj = {}

    for (i = 0; i < len; i++) {
        obj[arr[i]] = 0;
    }
    
    for (i in obj) {
        out.push(i);
    }
    return out;
}


function generateUniqueId(str) {
    let len = str.length;
    let chars = [];
    for (let i = 0; i < len; i++) {

        chars[i] = str[Math.floor((Math.random() * len))];

    }

    const filtered = eliminateDuplicates(chars);

    return filtered.join('');


}

module.exports=generateUniqueId
