'use strict';

let noPdfDownload = require('../app/src/headers.js');
let assert = require('assert');

/* Tests */
testChangeHeaders('Empty', [], false);

testChangeHeaders('False positive', [
    ['Server', 'nginx/1.13.7'],
    ['Content-Length', '456'],
    ['Content-Encoding', 'gzip'],
    ['Content-Type', 'text/html; charset=utf-8'],
], false);

testChangeHeaders('False positive HTML', [
    ['Content-Disposition', 'attachment'],
    ['Content-Type', 'text/html']
], false);

testChangeHeaders('False positive image', [
    ['Content-Type', 'image/jpeg'],
], false);

testChangeHeaders('Normal PDF', [
    ['Content-Type', 'Application/PDF'],
], [
    ['Content-Type', 'Application/PDF'],
    ['Content-Disposition', 'inline'],
]);

testChangeHeaders('Inline', [
    ['Content-Type', 'application/pdf'],
    ['Content-Disposition', 'inline'],
], false);

testChangeHeaders('Attachment', [
    ['Content-Type', 'application/pdf'],
    ['Content-Disposition', 'attachment'],
], [
    ['Content-Type', 'application/pdf'],
    ['Content-Disposition', 'inline'],
]);

testChangeHeaders('Attachment with filename', [
    ['Content-Type', 'application/pdf'],
    ['Content-Disposition', 'attachment;filename=test.pdf'],
], [
    ['Content-Type', 'application/pdf'],
    ['Content-Disposition', 'inline; filename=test.pdf'],
]);

testChangeHeaders('Attachment and inline (invalid)', [
    ['content-type', 'application/pdf'],
    ['Content-Disposition', 'attachment; filename=test.pdf; inline'],
], [
    ['content-type', 'application/pdf'],
    ['Content-Disposition', 'inline; filename=test.pdf; inline'],
]);

testChangeHeaders('Wrong mime', [
    ['Content-Type', 'application/x-pdf'],
], false);

console.log('All tests passed.');

/* Helper Functions */
// Tests header arrays. If expectedHeaders is set to false headers must not change.
function testChangeHeaders(name, headers, expectedHeaders) {
    console.log('Testing: ', name);

    // Prepare expected headers
    if(expectedHeaders === false) {
        expectedHeaders = headers;
    }
    expectedHeaders = makeHeaderArray(expectedHeaders).sort(cmpHeaders);

    // Get new headers
    headers = makeHeaderArray(headers);
    let newHeaders = noPdfDownload.changeHeaders(headers);
    if(newHeaders === undefined) {
        newHeaders = headers;
    }
    newHeaders.sort(cmpHeaders);

    // Test
    assert.deepEqual(newHeaders, expectedHeaders);
    console.log('√');
}

function makeHeaderArray(headers) {
    let headerArray = [];
    for(let values of headers) {
        headerArray.push({
            name: values[0],
            value: values[1],
        });
    }
    return headerArray;
}

function cmpHeaders(header1, header2) {
    // Compare by name
    if(header1.name != header2.name) {
        return header1.name > header2.name;
    }

    // Compare by value
    if(header1.value != header2.value) {
        return header1.value > header2.value;
    }
    return 0;
}
