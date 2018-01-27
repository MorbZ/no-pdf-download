'use strict';

const PDF_MIME_TYPE = 'application/pdf';
const HEADER_CONTENT_DISPOSITION = 'Content-Disposition';
const HEADER_CONTENT_TYPE = 'Content-Type';

function changeHeaders(headers) {
    // Check content type
    if(!hasPdfHeaders(headers)) {
        return;
    }

    // Remove attachment header. Also make sure to always add an inline header. This is needed to
    // prevent downloading if the HTML5 "download" tag is set. Only works in Firefox (57.0). Chrome
    // (62.0) will always download if "download"-tag is set.
    let i = getHeaderIndex(headers, HEADER_CONTENT_DISPOSITION);
    if(i !== false) {
        // Change header, first field must be attachment or inline
        let values = splitHeaderValue(headers[i].value);
        values[0] = 'inline';
        headers[i].value = joinHeaderValue(values);
    } else {
        // Add header
        headers.push({
            name: HEADER_CONTENT_DISPOSITION,
            value: 'inline'
        });
    }
    return headers;
}

function hasPdfHeaders(headers) {
    // Get header index
    let i = getHeaderIndex(headers, HEADER_CONTENT_TYPE);
    if(i === false) {
        return false;
    }

    // Check content type
    let values = splitHeaderValue(headers[i].value);
    let mimeType = values[0].toLowerCase();
    return PDF_MIME_TYPE == mimeType;
}

function getHeaderIndex(headers, name) {
    name = name.toLowerCase();
    for(let i in headers) {
        if(headers[i].name.toLowerCase() == name) {
            return i;
        }
    }
    return false;
}

function splitHeaderValue(value) {
    let values = value.split(';');
    for(let i in values) {
        values[i] = values[i].trim();
    }
    return values;
}

function joinHeaderValue(values) {
    return values.join('; ');
}

// Make functions available for tests
if(typeof(module) !== 'undefined') {
    module.exports.changeHeaders = changeHeaders;
}
