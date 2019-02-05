'use strict';

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
    [
        'responseHeaders',
        'blocking',
    ]
);
