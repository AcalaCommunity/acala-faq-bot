import { google } from "googleapis";
import { JWT } from "googleapis-common";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

export interface UserFeedback {
  id: string;
  question: string;
  answer: string;
  helpful?: boolean;
}

export default class Sheet {
  protected active = false;
  private jwt!: JWT;
  constructor(clientEmail: string, privateKey: string) {
    this.connect(clientEmail, privateKey);
  }

  private connect(clientEmail: string, privateKey: string) {
    const formattedPrivateKey = privateKey.split("\\n").join("\n");
    const jwtClient = new google.auth.JWT(
      clientEmail,
      undefined,
      formattedPrivateKey,
      SCOPES
    );

    jwtClient.authorize((err, tokens) => {
      if (err) {
        console.log(err);
      } else {
        this.jwt = jwtClient;
        this.active = true;
      }
    });
  }

  public updateSheet(userResponse: UserFeedback): boolean {
    if (!this.active) return false;

    let helpful: string = "N/A";

    if (userResponse.helpful != undefined) {
      helpful = userResponse.helpful ? "yes" : "no";
    }

    let sheets = google.sheets("v4");
    const spreadsheetId = "1aeGceDWV2ognX5tTLLSp9ywqKJP5fDGMj5GyGZDQvRU";

    let currentDate = new Date();
    const requests = [];
    requests.push({
      appendCells: {
        sheetId: 0,
        rows: [
          {
            values: [
              {
                userEnteredValue: {
                  stringValue: `${currentDate.getDate()}/${currentDate.getMonth()}/${currentDate
                    .getFullYear()
                    .toString()
                    .slice(2)} ${
                    currentDate.getHours()
                  }:${currentDate.getMinutes()}`,
                },
              },
              {
                userEnteredValue: {
                  stringValue: userResponse.id,
                },
              },
              {
                userEnteredValue: {
                  stringValue: userResponse.question,
                },
              },
              {
                userEnteredValue: {
                  stringValue: userResponse.answer,
                },
              },
              {
                userEnteredValue: {
                  stringValue: helpful,
                },
              },
            ],
          },
        ],
        fields: "*",
      },
    });

    sheets.spreadsheets.batchUpdate({
      spreadsheetId: spreadsheetId,
      auth: this.jwt,
      requestBody: {
        requests: requests,
      },
    });

    return true;
  }

  public updateNoMatchSheet(userId: string, question: string) {
    if (!this.active) return false;

    let sheets = google.sheets("v4");
    const spreadsheetId = "1aeGceDWV2ognX5tTLLSp9ywqKJP5fDGMj5GyGZDQvRU";

    let currentDate = new Date();
    const requests = [];
    requests.push({
      appendCells: {
        sheetId: 1,
        rows: [
          {
            values: [
              {
                userEnteredValue: {
                  stringValue: `${currentDate.getDate()}/${currentDate.getMonth()}/${currentDate
                    .getFullYear()
                    .toString()
                    .slice(2)} ${
                    currentDate.getHours()
                  }:${currentDate.getMinutes()}`,
                },
              },
              {
                userEnteredValue: {
                  stringValue: userId,
                },
              },
              {
                userEnteredValue: {
                  stringValue: question,
                },
              },
            ],
          },
        ],
        fields: "*",
      },
    });

    sheets.spreadsheets.batchUpdate({
      spreadsheetId: spreadsheetId,
      auth: this.jwt,
      requestBody: {
        requests: requests,
      },
    });

    return true;
  }
}
