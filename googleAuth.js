const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const {authenticate} = require('@google-cloud/local-auth');
const {google} = require('googleapis');
const { match } = require('assert');
// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentialsGoog.json');

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

/**
 * Serializes credentials to a file comptible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
async function getValues(spreadsheetId, range) {

  let auth = await authorize();
  const service = google.sheets({version: 'v4', auth});
  try {
    const result = await service.spreadsheets.values.get({
      spreadsheetId,
      range,
    });
    numRows = result.data.values ? result.data.values.length : 0;
    console.log(`${numRows} rows retrieved.`);
    let text = "";
    for (x of result.data.values) {
      text += x;
    };
    console.log(text);
    console.log(result.data.range);
    console.log(typeof text)
    return text;
  } catch (err) {
    // TODO (developer) - Handle exception
    throw err;
  }

};
//Writes values from user input to the appropriate spreadsheet sheet.
async function writeValues(spreadsheetId, range, inputValues) {
  let auth = await authorize();
  const service = google.sheets({version: 'v4', auth});
  values = [inputValues];
  console.log(inputValues);
  const resource = {
    range,
    majorDimension: "ROWS",
    values,
  };
  try {
    const result = await service.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: "RAW",
      resource,
    });
    console.log('%d cells updated.', result.data.updatedCells);
    return result;
  } catch(err) {
    throw err;
  }
}
//Returns the range of cells on a sheet that contain values
async function returnTableRange(spreadsheetId, range) {
  let auth = await authorize();
  const service = google.sheets({version: 'v4', auth});
  try {
    const result = await service.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    if (!result.data.values) {
      await writeValues(spreadsheetId, `${range}!A1:B1`, 'Name', 'Information')
      const tableRange = `${range}!A1:B1`;
      console.log(`Had to make table headers.`);
      return tableRange;
    }
    else {
    const tableRange = `${range}!A1:B${result.data.values.length}`
    return tableRange;
    }
  }
  catch(err){
    throw err;
  }
}

async function returnEntries(spreadsheetId, range, majorDimension){
  let auth = await authorize();
  const service = google.sheets({version: 'v4', auth});
  try {
    const result = await service.spreadsheets.values.get({
      spreadsheetId,
      range,
      majorDimension
    });

return result;
  }
  catch(err){
    throw err;
  }
}

async function appendValues(spreadsheetId, range, inputValues) {
  let auth = await authorize();
  const service = google.sheets({version: 'v4', auth});
  values = [inputValues];
  console.log(inputValues);
  const resource = {
    range,
    majorDimension: "ROWS",
    values,
  };
  try {
    const result = await service.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "RAW",
      resource,
    });
    console.log('%d cells updated.', result.data.updatedCells);
    return result;
  } catch(err) {
    throw err;
  }
}
async function returnBatchRanges(spreadsheetId, batchRange, majorDimension){
  let auth = await authorize();
  const service = google.sheets({version: 'v4', auth});
  try {
    const result = await service.spreadsheets.values.batchGet({
      spreadsheetId,
      ranges: batchRange,
      majorDimension
    });

return result;
  }
  catch(err){
    throw err;
  }
}



async function editEntry(spreadsheetId, range, dataEntry){ //finds and edits an entry given an array with a named string value in its first index.
  let auth = await authorize();
  const service = google.sheets({version: 'v4', auth});
  try {
    const result = await service.spreadsheets.values.get({
      spreadsheetId,
      range,
      majorDimension: `ROWS`
    });
let matchRow = 2;
result.data.values.shift();

for (x of result.data.values){
    if (x[0].toLowerCase() === dataEntry[0].toLowerCase()) {
      const finalRange = `'${range}'!${matchRow}:${matchRow}`
      await writeValues(spreadsheetId, finalRange, dataEntry);
      return console.log(`Entry found & edited.`)
    }
    matchRow += 1;
}
return console.log(`No matching entry found.`)
  }
  catch(err){
    throw err;
  }
}
module.exports = {
  getValues,
  authorize,
  loadSavedCredentialsIfExist,
  saveCredentials,
  writeValues,
  returnTableRange,
  returnEntries,
  appendValues,
  returnBatchRanges,
  editEntry
}