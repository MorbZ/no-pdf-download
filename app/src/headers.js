'use strict';

const PDF_EXTENSION = '.pdf'
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
const BINARY_MIME_TYPES = [
    'application/octet-stream',
    'application/force-download',
    'binary/octet-stream',
];
const HEADER_CONTENT_DISPOSITION = 'Content-Disposition';
const HEADER_CONTENT_TYPE = 'Content-Type';

function handleHeaders(url, headers) {
    // Get content type header
    let ct = getHeader(headers, HEADER_CONTENT_TYPE);
    if(ct.i == -1) {
        return;
    }

    // Check for PDF and modify headers if needed
    let cd = getHeader(headers, HEADER_CONTENT_DISPOSITION);
    if(isPdf(url, ct.v, cd.v)) {
        changeHeaders(headers, ct, cd);
        return headers;
    }
}

function isPdf(url, type, disposition) {
    // Check if content type is PDF
    let mimeType = getFirstHeaderField(type).toLowerCase();
    if(PDF_MIME_TYPES.includes(mimeType)) {
        return true;
    }

    // Octet-streams may be PDFs, we have to check the extension
    if(!BINARY_MIME_TYPES.includes(mimeType)) {
        return false;
    }

    // Check content disposition filename
    let filename = getDispositionFilename(disposition);
    if(filename !== false) {
        // Return either way bacause we got the "official" file name
        return filename.toLowerCase().endsWith(PDF_EXTENSION);
    }

    // In case there is no disposition file name, we check for URL (without
    // query string).
    url = url.split('?')[0];
    return url.toLowerCase().endsWith(PDF_EXTENSION);
}

// Returns the first filename found in content disposition header
function getDispositionFilename(disposition) {
    // Filename may be in quotes, see: https://tools.ietf.org/html/rfc2183
    // Regex: https://regex101.com/r/NJiElq/5
    let re = /; ?filename=(?:(?:\"(.*?)\")|([^;"]+))/i;
    let m = re.exec(disposition);
    if(m === null) {
        return false;
    }
    return m[1] !== undefined ? m[1] : m[2];
}

function changeHeaders(headers, ct, cd) {
    // Normalize PDF mime type
    headers[ct.i].value = replaceFirstHeaderField(ct.v, PDF_MIME_TYPE);

    // Remove attachment header. Also make sure to always add an inline header.
    // This is needed to prevent downloading if the HTML5 "download" tag is set.
    // Only works in Firefox (57.0). Chrome (62.0) will always download if
    // "download"-tag is set.
    if(cd.i == -1) {
        headers.push({
            name: HEADER_CONTENT_DISPOSITION,
            value: 'inline'
        });
    } else {
        headers[cd.i].value = replaceFirstHeaderField(cd.v, 'inline');
    }
}

/* Header Helpers */
// Returns an object where i is header index and v is the header value. If the
// header does not exist, i will be -1.
function getHeader(headers, name) {
    name = name.toLowerCase();
    for(let i in headers) {
        if(headers[i].name.toLowerCase() == name) {
            return {i: i, v: headers[i].value};
        }
    }
    return {i: -1, v: ''};
}

// Replaces text before the first semicolon with the given string
function replaceFirstHeaderField(value, replace) {
    let i = value.indexOf(';');
    if(i == -1) {
        return replace;
    } else {
        return replace + value.substring(i);
    }
}

// Returns the text before the first semicolon without leading/trailing spaces
function getFirstHeaderField(value) {
    let i = value.indexOf(';');
    let str = i == -1 ? value : value.substring(0, i);
    return str.trim();
}

// Make functions available for tests
if(typeof(module) !== 'undefined') {
    module.exports.handleHeaders = handleHeaders;
}
