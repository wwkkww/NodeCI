
const Buffer = require('safe-buffer').Buffer;
const Keygrip = require('keygrip');
const keys = require('../../config/keys');
const keygrip = new Keygrip([keys.cookieKey])

module.exports = (user) => {
  const sessionObject = {
    // user._id from mongoose is a js object. use toString to parse it
    passport: { user: user._id.toString() }
  };
  // convert session obj into base64 string
  const session = Buffer.from(JSON.stringify(sessionObject)).toString('base64');

  const sig = keygrip.sign('session=' + session)
  // console.log("sessionString", sessionString)
  // console.log("signature", signature)
  // expect(keygrip.verify('session=' + sessionString, signature)).toEqual(true);

  return { session, sig };
}