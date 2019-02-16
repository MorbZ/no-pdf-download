'use strict';

// For Chrome we have to use "extraHeaders" to get the cookie header
let extraInfoSpec = [
    'responseHeaders',
    'blocking',
];
if(chrome.webRequest.OnBeforeSendHeadersOptions.hasOwnProperty('EXTRA_HEADERS')) {
    extraInfoSpec.push('extraHeaders');
}

// Register receiver for reponse headers
chrome.webRequest.onHeadersReceived.addListener(
    (details) => {
        let newHeaders = handleHeaders(details.url, details.responseHeaders);
        if(newHeaders !== undefined) {
            return {
                responseHeaders: newHeaders
            };
        }
    },
    {
        types: [
            'main_frame',
            'sub_frame',
        ],
        urls: ['<all_urls>'],
    },
    extraInfoSpec
);
