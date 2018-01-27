'use strict';

chrome.webRequest.onHeadersReceived.addListener(
    (details) => {
        let newHeaders = changeHeaders(details.responseHeaders);
        if(newHeaders !== undefined) {
            return {
                responseHeaders: newHeaders
            };
        }
    },
    {
        types: ['main_frame'],
        urls: ['<all_urls>'],
    },
    [
        'responseHeaders',
        'blocking',
    ]
);
