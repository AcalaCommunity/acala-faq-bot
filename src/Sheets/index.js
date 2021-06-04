"use strict";
exports.__esModule = true;
var fs = require("fs");
var googleapis_1 = require("googleapis");
// If modifying these scopes, delete token.json.
var SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
// ts-ignore
function connect() {
    var credentials = fs.readFileSync("./credentials.json", { encoding: "utf-8" });
    var _a = JSON.parse(credentials), client_email = _a.client_email, private_key = _a.private_key;
    var jwtClient = new googleapis_1.google.auth.JWT(client_email, undefined, private_key, SCOPES);
    jwtClient.authorize(function (err, tokens) {
        if (err) {
            console.log(err);
        }
        else {
            console.log("success!");
            updateSheet(jwtClient);
        }
    });
}
connect();
function updateSheet(jwtClient) {
    var sheets = googleapis_1.google.sheets("v4");
    var spreadsheetId = "1aeGceDWV2ognX5tTLLSp9ywqKJP5fDGMj5GyGZDQvRU";
    var requests = [];
    requests.push({
        "appendCells": {
            "sheetId": 0,
            "rows": [
                {
                    "values": [
                        {
                            "userEnteredValue": {
                                "stringValue": "bob"
                            }
                        },
                        {
                            "userEnteredValue": {
                                "stringValue": "what is Karura"
                            }
                        },
                        {
                            "userEnteredValue": {
                                "stringValue": "A blockchain"
                            }
                        },
                        {
                            "userEnteredValue": {
                                "stringValue": "yes"
                            }
                        }
                    ]
                }
            ],
            "fields": "*"
        }
    });
    //Google Sheets API
    var sheetName = 'Feedback';
    sheets.spreadsheets.values.get({
        auth: jwtClient,
        spreadsheetId: spreadsheetId,
        range: sheetName
    }, function (err, response) {
        if (err) {
            console.log('The API returned an error: ' + err);
        }
        else {
            console.log('Movie list from Google Sheets:');
            console.log(response === null || response === void 0 ? void 0 : response.data.values);
        }
    });
    sheets.spreadsheets.batchUpdate({
        spreadsheetId: spreadsheetId,
        auth: jwtClient,
        requestBody: {
            // request body parameters
            // {
            //   "includeSpreadsheetInResponse": false,
            "requests": requests
        }
    });
}
