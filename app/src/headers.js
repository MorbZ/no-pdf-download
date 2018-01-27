'use strict';

const PDF_MIME_TYPE = 'application/pdf';
const PDF_MIME_TYPES = [
    'application/pdf',
    'image/pdf',
    'text/pdf',
    'application/x-pdf',
    'image/x-pdf',
    'text/x-pdf',
    'application/acrobat',
    'applications/vnd.pdf',
];
const HEADER_CONTENT_DISPOSITION = 'Content-Disposition';
const HEADER_CONTENT_TYPE = 'Content-Type';

function changeHeaders(headers) {
    // Get content type header
    let i = getHeaderIndex(headers, HEADER_CONTENT_TYPE);
    if(i === false) {
        return;
    }

    // Check if content type is PDF
    let values = splitHeaderValue(headers[i].value);
    let mimeType = values[0].toLowerCase();
    if(!PDF_MIME_TYPES.includes(mimeType)) {
        return;
    }

    // Sanitize PDF mime type
    values[0] = PDF_MIME_TYPE;
    headers[i].value = joinHeaderValue(values);

    // Set content disposition to inline
    changeContentDisposition(headers);
    return headers;
}

function changeContentDisposition(headers) {
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
