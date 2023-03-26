const jObjProc = function (obj) {
    var result = "";
    for (var p in obj) {
        if (obj[p] === null) {result += '<li>' + p + ' : null</li>'}
        else {
            switch (typeof(obj[p])) {
                case "string": result += '<li>' + p + ' : <span style="color: green">"' + obj[p] + '"</span></li>';break;
                case "boolean": result += '<li>' + p + ' : <span style="color: purple">' + obj[p] + '</span></li>';break;
                case "number": result += '<li>' + p + ' : <span style="color: lightskyblue">' + obj[p] + '</span></li>';break;
                case "object": 
                if (Array.isArray(obj[p])) result += '<li><details><summary>' + p + ' : <span style="color: red">' + jArrProc(obj[p]) + '</span></li>';
                else result += '<li><details><summary>' + p + ' : <span style="color: yellow">' + jObjProc(obj[p]) + '</span></li>';
                break;
            } 
        }
        };
    return "{ " + Object.keys(obj).length + " }</summary><ul style = 'list-style-type:none'>" + result + "</ul></details>";
};
const jArrProc = function (arr) {
    var result = "";
    for (var i=0;i<arr.length;i++) {
        if (arr[i] === null) {result += '<li>' + i + ' : null</li>'}
        else {
            switch (typeof(arr[i])) {
                case "string": result += '<li>' + i + ' : <span style="color: green">"' + arr[i] + '"</span></li>';break;
                case "boolean": result += '<li>' + i + ' : <span style="color: purple">' + arr[i] + '</span></li>';break;
                case "number": result += '<li>' + i + ' : <span style="color: lightskyblue">' + arr[i] + '</span></li>';break;
                case "object": 
                if (Array.isArray(arr[i])) result += '<li><details><summary>' + i + ' : <span style="color: red">' + jArrProc(arr[i]) + '</span></li>';
                else result += '<li><details><summary>' + i + ' : <span style="color: yellow">' + jObjProc(arr[i]) + '</span></li>';
                break;
            } 
        }
    };
    return "[ " + arr.length + " ]</summary><ul style = 'list-style-type:none'>" + result + "</ul></details>";
};

export default jObjProc
