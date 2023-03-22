const fs = require('fs')
const credentials = JSON.parse(fs.readFileSync('credentials.json').toString())
const sendgrid = require('sendgrid')
const helper = sendgrid.mail
const sg = sendgrid(credentials.email)
const client = require('jsreport-client')(credentials.jo.url, credentials.jo.username, credentials.jo.password)

const mail = function (message) {
  console.log(message)

  const fromEmail = new helper.Email(credentials.supportEmail)
  const toEmail = new helper.Email(credentials.senderEmail)
  const subject = message.substring(0, 200)
  const content = new helper.Content('text/plain', message)
  const mail = new helper.Mail(fromEmail, subject, toEmail, content)

  const request = sg.emptyRequest({
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

let lastError
let lastErrorNotification
const error = function (err) {
  lastError = err
  if (!lastErrorNotification || (lastErrorNotification < new Date(new Date().getTime() - (30 * 60 * 1000)))) { // 30 min
    lastErrorNotification = new Date()
    mail('jope ' + err.message + err.stack)
  } else {
    console.log('skipping sending error')
  }
}

const ok = function () {
  console.log('ok')

  if (lastError) {
    lastError = null
    mail('jo - ok resolved')
  }
}

const ping = function () {
  console.log('ping')

  const start = new Date().getTime()

  client.render({
    template: {
      content: 'Hello {{foo}}',
      recipe: 'chrome-pdf',
      engine: 'handlebars'
    },
    data: {
      foo: 'world'
    }
  }, (err) => {
    if (err) {
      return error(err)
    }

    if (new Date().getTime() - start > 5000) {
      return error(new Error(`long request, elapsed: ${new Date().getTime() - start}ms`))
    }

    return ok()
  })
}

setInterval(ping, 5 * 60 * 1000) // 5 min
ping()
