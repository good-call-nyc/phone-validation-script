require('dotenv').config()
var request = require('request')
var accountSid = process.env.ACCOUNT_SID
var authToken = process.env.AUTH_TOKEN

var ProgressBar = require('progress')
var fs = require('fs')
var del = require('delete')
var path = require('path')
var input = process.argv[2]

var validPhoneNumbersPath = 'valid-phone-numbers.txt'
var invalidPhoneNumbersPath = 'invalid-phone-numbers.txt'

del.sync([validPhoneNumbersPath, invalidPhoneNumbersPath])

fs.readFile(input, function (err, data) {
  if (err) throw err
  var phoneNumbers = formatPhoneNumberFileData(data)
  var bar = new ProgressBar('  verifying [:bar] :percent :etas', {
    complete: '=',
    incomplete: ' ',
    width: 20,
    total: phoneNumbers.length
  })

  phoneNumbers.forEach(validatePhone)

  function validatePhone (phone) {
    request({
      method: 'GET',
      url: 'https://lookups.twilio.com/v1/PhoneNumbers/' + phone + '?Type=carrier',
      auth: {
        user: accountSid,
        pass: authToken
      }
    }, function (err, res, body) {
      if (err) throw err

      var json = JSON.parse(body)

      bar.tick()

      var appendFileOptions = {}
      if (json.status === 404) {
        appendFileOptions.filename = invalidPhoneNumbersPath
        appendFileOptions.msg = phone + ', invalid'
      } else {
        var carrierType = json['carrier']['type']
        if (carrierType === 'mobile') {
          appendFileOptions.filename = validPhoneNumbersPath
          appendFileOptions.msg = phone
        } else {
          appendFileOptions.filename = invalidPhoneNumbersPath
          appendFileOptions.msg = phone + ', carrierType: ' + carrierType
        }
      }
      var outputPath = path.join(process.cwd(), appendFileOptions.filename)
      fs.appendFile(outputPath, appendFileOptions.msg + '\n', function (err) {
        if (err) throw err
      })
    })
  }
})


function formatPhoneNumberFileData (data) {
  return data.toString().split('\n').filter(Boolean).map(function (phoneNumber) {
    return phoneNumber.replace(/\D/g, '')
  })
}
