const emailRegexUnicode = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

// Just check if it starts with a + and the rest are all digits.
// I think anything more is almost impossible. Allow 2-15 digits.
const phoneRegex = /^\+?\d{2,15}$/;

module.exports = {
  emailRegexUnicode,

  testEmail: email => emailRegexUnicode.test(String(email).toLowerCase()),

  phoneRegex,

  testPhone: phone => phoneRegex.test(String(phone)),

  testPhoneLenient: phone => /^\+?\d{0,15}$/.test(String(phone)) // For use on not fully formed numbers
}