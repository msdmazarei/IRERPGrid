define(['require', 'exports', 'module'], function(require, exports, module) {
"use strict";

function convertData(obj) {
    return Object.keys(obj).map(function(key) {
        var data = obj[key];
        if (typeof data === 'object')
            data = JSON.stringify(data);
        return key + "=" + encodeURIComponent(data);
    }).join("&");
}

function xhr(options) {

    function xhrPromise(resolve, reject) {

        function onLoad() {
            // This is called even on 404 etc
            // so check the status
            if (req.status == 200) {
                // Resolve the promise with the response text
                resolve(req.response);
            } else {
                // Otherwise reject with the status text
                // which will hopefully be a meaningful error
                reject(Error(req.statusText));
            }
        }

        // Handle network errors
        function onError() {
            reject({ ErrorCode: req.status, ErrorMessage: req.statusText });
        };

        // Do the usual XHR stuff
        var req = new XMLHttpRequest();
        req.open('POST', options.url);
        req.setRequestHeader("Content-type", "application/x-www-form-urlencoded")

        req.addEventListener('load', onLoad);
        req.addEventListener('error', onError);
        req.addEventListener('timeout', onError);

        // Make the request
        if (options.beforesend)
            options.beforesend(req);
        var data = convertData(options.data)
        req.send(data);
    }

    // Return a new promise.
    return new Promise(xhrPromise);
}

return xhr;

})