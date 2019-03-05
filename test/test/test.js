'use strict';

let noPdfDownload = require('../../app/src/headers.js');
let assert = require('assert');

describe('Handle Headers', () => {
    testHandleHeaders('Empty', '', [], false);

    testHandleHeaders('False positive', '', [
        ['Server', 'nginx/1.13.7'],
        ['Content-Length', '456'],
        ['Content-Encoding', 'gzip'],
        ['Content-Type', 'text/html; charset=utf-8'],
    ], false);

    testHandleHeaders('False positive HTML', 'http://test.com/test.pdf', [
        ['Content-Disposition', 'attachment'],
        ['Content-Type', 'text/html']
    ], false);

    testHandleHeaders('False positive image', '', [
        ['Content-Disposition', 'attachment; filename=test.pdf'],
        ['Content-Type', 'image/jpeg'],
    ], false);

    testHandleHeaders('Normal PDF', '', [
        ['Content-Type', 'Application/PDF'],
    ], [
        ['Content-Type', 'application/pdf'],
        ['Content-Disposition', 'inline'],
    ]);

    testHandleHeaders('Inline', '', [
        ['Content-Type', 'application/pdf'],
        ['Content-Disposition', 'inline'],
    ], false);

    testHandleHeaders('Attachment', '', [
        ['Content-Type', 'application/pdf'],
        ['Content-Disposition', 'ATTACHMENT'],
    ], [
        ['Content-Type', 'application/pdf'],
        ['Content-Disposition', 'inline'],
    ]);

    testHandleHeaders('Attachment with filename', 'http://test.com/test.pdf', [
        ['Content-Type', 'application/pdf'],
        ['Content-Disposition', 'attachment;filename=test.pdf'],
    ], [
        ['Content-Type', 'application/pdf'],
        ['Content-Disposition', 'inline;filename=test.pdf'],
    ]);

    testHandleHeaders('Attachment and inline (invalid)', '', [
        ['content-type', 'application/pdf'],
        ['Content-Disposition', 'attachment; filename=test.pdf; inline'],
    ], [
        ['content-type', 'application/pdf'],
        ['Content-Disposition', 'inline; filename=test.pdf; inline'],
    ]);

    testHandleHeaders('Charset', '', [
        ['Content-Type', 'application/pdf;charset=ISO-8859-1'],
    ], [
        ['Content-Type', 'application/pdf;charset=ISO-8859-1'],
        ['Content-Disposition', 'inline'],
    ]);

    testHandleHeaders('x-PDF', '', [
        ['Content-Type', 'application/x-pdf'],
    ], [
        ['Content-Type', 'application/pdf'],
        ['Content-Disposition', 'inline'],
    ]);

    testHandleHeaders('Image-PDF', '', [
        ['Expires', 'Sat, 27 Jan 2018 22:48:52 GMT'],
        ['Content-Type', 'image/pdf;charset=ISO-8859-1'],
    ], [
        ['Expires', 'Sat, 27 Jan 2018 22:48:52 GMT'],
        ['Content-Type', 'application/pdf;charset=ISO-8859-1'],
        ['Content-Disposition', 'inline'],
    ]);

    testHandleHeaders('Octet-stream with PDF file name and invalid', '', [
        ['Content-Type', 'application/octet-stream'],
        ['Content-Disposition', 'attachment;filename="te;t.pdf";filename=img.jpg'],
    ], [
        ['Content-Type', 'application/pdf'],
        ['Content-Disposition', 'inline;filename="te;t.pdf";filename=img.jpg'],
    ]);

    testHandleHeaders('Octet-stream with image', 'http://test.com/test.pdf', [
        ['Content-Type', 'application/octet-stream'],
        ['Content-Disposition', 'attachment;filename=image.jpg'],
    ], false);

    testHandleHeaders('Octet-stream with PDF in URL', 'http://test.com/test.PDF?1', [
        ['Content-Type', 'application/OCTET-stream '],
    ], [
        ['Content-Type', 'application/pdf'],
        ['Content-Disposition', 'inline'],
    ]);

    testHandleHeaders('Binary/Octet-stream with PDF file name(s)', 'http://test.com/02000', [
        ['Content-Disposition', 'attachment; filename="ABC_2019.pdf"; filename*=UTF-8\'\'ABC_2019.pdf'],
        ['Content-Type', 'binary/octet-stream'],
    ], [
        ['Content-Disposition', 'inline; filename="ABC_2019.pdf"; filename*=UTF-8\'\'ABC_2019.pdf'],
        ['Content-Type', 'application/pdf'],
    ]);
});

/* Helper Functions */
// Tests header arrays. If expectedHeaders is set to false headers must not
// change.
function testHandleHeaders(name, url, headers, expectedHeaders) {
    // Prepare expected headers
    if(expectedHeaders === false) {
        expectedHeaders = headers;
    }
    expectedHeaders = makeHeaderArray(expectedHeaders).sort(cmpHeaders);

    // Get new headers
    headers = makeHeaderArray(headers);
    let newHeaders = noPdfDownload.handleHeaders(url, headers);
    if(newHeaders === undefined) {
        newHeaders = headers;
    }
    newHeaders.sort(cmpHeaders);

    // Test
    it(name, () => {
        assert.deepStrictEqual(newHeaders, expectedHeaders);
    })
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
