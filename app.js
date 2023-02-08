require('dotenv').config()
const Mastodon = require('mastodon-api')

const M = new Mastodon({
  client_key: process.env.CLIENT_KEY,
  client_secret: process.env.CLIENT_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
  api_url: 'https://mstdn.ca/api/v1/', // optional, defaults to https://mastodon.social/api/v1/
})

function parseBills(id, html) {
  html.forEach((eachBill) => {
    tootThread(eachBill, null, id)
  })
}

const tootThread = (message, billHtml, id) => {
  const params = {
    status: message,
  }

  if (id) {
    params.in_reply_to_id = id
  }

  return new Promise((resolve, reject) => {
    M.post('statuses', params, (error, data) => {
      if (error) {
        console.error(error)
      } else {
        if (!id) {
          parseBills(data.id, billHtml)
        } else return
      }
    })
  })
}

module.exports = { tootThread }
