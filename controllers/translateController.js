const { Translate } = require('@google-cloud/translate').v2
const clc = require('cli-color')

// Initialize the Translate object with the API key
const translate = new Translate({
  key: process.env.GOOGLE_TRANSLATE_API_KEY,
})

const translateText = async (text) => {
  try {
    // Translate the text from Hebrew to English
    const [translation] = await translate.translate(text, 'en')
    return translation
  } catch (error) {
    console.error(error)
    throw new Error('Translation failed.')
  }
}

const translateController = async (req, res) => {
  try {
    const { text } = req.body
    console.log(clc.blue('This translateed text '))
    console.log(text)
    console.log(clc.blue('This translateed text '))
    const translatedText = await translateText(text)

    res.json({ translation: translatedText })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Translation failed.' })
  }
}

module.exports = {
  translateController,
}
