'use strict';

const HEADER_VALUE_SEPARATOR = '; ';
const PDF_MIME_TYPES = [
    'application/pdf',
    'application/x-pdf',
];

chrome.webRequest.onHeadersReceived.addListener(
    headersReceived,
    {
        types: ['main_frame'],
        urls: ['<all_urls>'],
    },
    [
        'responseHeaders',
        'blocking',
    ]
);

function headersReceived(details) {
    let headers = details.responseHeaders;

    // Check content type
    for(let header of headers) {
        // Search for content type
        if(header.name.toLowerCase() == 'content-type') {
            // Check if PDF
            let values = splitHeaderValue(header.value);
            let mimeType = values[0].toLowerCase();
            if(!PDF_MIME_TYPES.includes(mimeType)) {
                return;
            }
        }
    }

    // Remove download trigger
    for(let i in headers) {
        let values = splitHeaderValue(headers[i].value);
        for(let j in values) {
            if(values[j].toLowerCase() == 'attachment') {
                // Change headers
                values[j] = 'inline';
                let newValue = joinHeaderValue(values);
                headers[i].value = newValue;
                return {
                    responseHeaders: headers
                };
            }
        }
    }
}

function splitHeaderValue(value) {
    return value.split(HEADER_VALUE_SEPARATOR);
}

function joinHeaderValue(values) {
    return values.join(HEADER_VALUE_SEPARATOR);
}
