const CronJob = require('cron').CronJob
const axios = require('axios')
const { tootThread } = require('./app')

const url = `https://www.parl.ca/legisinfo/en/overview/json/onagenda`

function getGovernmentBills() {
  return axios.get(url)
}

new CronJob(
  '0 7 * * *', // everyday at 7 am
  function () {
    // Call Twitter BOT to post new Tweet
    getGovernmentBills()
      .then((response) => {
        const allBills = response.data
        if (allBills.length === 0) {
          const tweetText = `${new Date().toLocaleDateString(
            'en-GB'
          )}\nParliament is not sitting today.\nMore information: https://www.parl.ca/legisinfo/\n#cdnpoli`
          tootThread(tweetText)
        } else {
          const governmentBills = allBills.filter(
            (bill) => bill.IsGovernmentBill
          )
          if (governmentBills.length === 0) {
            const tweetText = `${new Date().toLocaleDateString(
              'en-GB'
            )}\nNo government bills being debated today.\nMore information: https://www.parl.ca/legisinfo/\n#cdnpoli`
            tootThread(tweetText)
          } else {
            const formattedBills = governmentBills.map((bill) => {
              return {
                number: bill.NumberCode,
                title: bill.LongTitle,
                status: bill.StatusName,
                url: `http://www.parl.ca/legisinfo/en/bill/${bill.ParliamentNumber}-${bill.SessionNumber}/${bill.NumberCode}`,
                minister: bill.SponsorAffiliationTitle,
              }
            })
            const tootTextHtml = formattedBills.map((bill) => {
              return `Bill: ${bill.number}\nTitle: ${bill.title}\nStatus: ${bill.status}\nLink: ${bill.url}\nPortfolio: ${bill.minister}`
            })

            tootThread(
              `${new Date()}\nGood morning, there are ${
                tootTextHtml.length
              } bills on the agenda today. Please find information for them below. #cdnpoli                                                                            `,
              tootTextHtml,
              null
            )
            // const formattedBills = governmentBills.map(
            //   (bill) =>
            //     `${bill.NumberCode} - ${bill.LongTitle}: ${bill.StatusName}.`
            // )
            // const tweetText = `${new Date().toLocaleDateString(
            //   'en-GB'
            // )}\n${formattedBills.join('\r\n')}\n#cdnpoli`
            // tootThread(tweetText)
          }
        }
      })
      .catch((err) => {
        console.error(err)
        tootThread('Having technical difficulties.')
      })
  },
  null,
  true,
  'America/Toronto'
)
