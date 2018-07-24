var fs = require('fs')
var credentials = JSON.parse(fs.readFileSync('credentials.json').toString())
var sendgrid = require('sendgrid')
var helper = sendgrid.mail
var sg = sendgrid(credentials.email)
var client = require("jsreport-client")(credentials.jo.url, credentials.jo.username, credentials.jo.password)

var mail = function (message) {
  console.log(message)

  var from_email = new helper.Email(credentials.supportEmail)
  var to_email = new helper.Email(credentials.senderEmail)
  var subject = message.substring(0, 200)
  var content = new helper.Content('text/plain', message);
  var mail = new helper.Mail(from_email, subject, to_email, content);

  var request = sg.emptyRequest({
    method: 'POST',
    path: '/v3/mail/send',
    body: mail.toJSON()
  })

  sg.API(request, function (err, response) {
    if (err) {
      console.error(err)
    }
  })
}

var linuxWorker = function (cb) {
  client.render({
    template: {
      content: 'Hello {{foo}}',
      recipe: 'phantom-pdf',
      phantom: {
        phantomjsVersion: '1.9.8'
      },
      engine: 'handlebars'
    }
  }, cb)
}

var windowsWorker = function (cb) {
  client.render({
    template: {
      content: 'Hello {{:foo}}',
      recipe: 'phantom-pdf',
      phantom: {
        phantomjsVersion: '1.9.8-windows'
      },
      engine: 'jsrender'
    }
  }, cb)
}

var lastError
var lastErrorNotification
var error = function (err) {
  lastError = err
  if (!lastErrorNotification || (lastErrorNotification < new Date(new Date().getTime() - (30 * 60 * 1000)))) { // 30 min
    lastErrorNotification = new Date()
    mail('jope ' + err.stack)
  } else {
    console.log('skipping sending error')
  }
}

var ok = function () {
  console.log('ok')

  if (lastError) {
    lastError = null
    mail('jo - ok resolved')
  }
}


var ping = function () {
  console.log('ping')

  linuxWorker(function (err) {
    if (err) {
      return error(err)
    }

    windowsWorker(function (e) {
      if (e) {
        return error(e)
      }

      ok()
    })
  })
}

setInterval(ping, 5 * 60 * 1000) // 5 min
ping()
