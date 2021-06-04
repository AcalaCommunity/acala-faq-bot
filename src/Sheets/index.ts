import { google } from "googleapis";
import { JWT } from "googleapis-common";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

export interface UserFeedback {
  id: string;
  question: string;
  answer: string;
  helpful: boolean;
}

export default class Sheet {
  protected active = false;
  private jwt!: JWT;
  constructor(credentials: string) {
    this.connect(credentials);
  }

  private connect(credentials: string) {
    const { client_email, private_key } = JSON.parse(credentials);

    const jwtClient = new google.auth.JWT(
      client_email,
      undefined,
      private_key,
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
                  stringValue: userResponse.helpful ? "yes" : "no",
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
