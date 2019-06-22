'use strict'

/*  ------------------------------------------------------------------------ */

const CryptoJS = require ('../../static_dependencies/crypto-js/crypto-js')
const { capitalize } = require ('./string')
const { stringToBase64, utf16ToBase64, urlencodeBase64 } = require ('./encode')
const NodeRSA = require ('./../../static_dependencies/node-rsa/NodeRSA');

/*  ------------------------------------------------------------------------ */

const hash = (request, hash = 'md5', digest = 'hex') => {
    const result = CryptoJS[hash.toUpperCase ()] (request)
    return (digest === 'binary') ? result : result.toString (CryptoJS.enc[capitalize (digest)])
}

/*  .............................................   */

const hmac = (request, secret, hash = 'sha256', digest = 'hex') => {
    const result = CryptoJS['Hmac' + hash.toUpperCase ()] (request, secret)
    if (digest) {
        const encoding = (digest === 'binary') ? 'Latin1' : capitalize (digest)
        return result.toString (CryptoJS.enc[capitalize (encoding)])
    }
    return result
}

/*  .............................................   */

/**
 * @return {string}
 */
const jwt = function JSON_web_token (request, secret, alg = 'HS256') {
    const algos = {
        'HS256': 'sha256',
        'HS384': 'sha384',
        'HS512': 'sha512',
        'RS256': 'pkcs1-sha256',
        'RS512': 'pkcs1-sha512',
    };
    const encodedHeader = urlencodeBase64 (stringToBase64 (JSON.stringify ({ 'alg': alg, 'typ': 'JWT' })))
    const encodedData = urlencodeBase64 (stringToBase64 (JSON.stringify (request)))
    const token = [ encodedHeader, encodedData ].join ('.')
    if (!(alg in algos)) {
        throw new ExchangeError (alg + ' is not a supported jwt algorithm.')
    }
    const algoType = alg.slice (0, 2);
    const algorithm = algos[alg]
    let signature = undefined
    if (algoType === 'HS') {
        signature = urlencodeBase64 (utf16ToBase64 (hmac (token, secret, algorithm, 'utf16')))
    } else if (algoType === 'RS') {
        const key = new NodeRSA (secret, {
            'environment': 'browser',
            'signingScheme': algorithm,
            'encryptionScheme': 'pkcs1',
        })
        signature = urlencodeBase64 (key.sign (token, 'base64', 'binary'))
    }
    return [ token, signature ].join ('.')
}

/*  ------------------------------------------------------------------------ */

const totp = (secret) => {

    const dec2hex = s => ((s < 15.5 ? '0' : '') + Math.round (s).toString (16))
        , hex2dec = s => parseInt (s, 16)
        , leftpad = (s, p) => (p + s).slice (-p.length) // both s and p are short strings

    const base32tohex = (base32) => {
        const base32chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
        let bits = ''
        let hex = ''
        for (let i = 0; i < base32.length; i++) {
            const val = base32chars.indexOf (base32.charAt (i).toUpperCase ())
            bits += leftpad (val.toString (2), '00000')
        }
        for (let i = 0; i + 4 <= bits.length; i += 4) {
            const chunk = bits.substr (i, 4)
            hex = hex + parseInt (chunk, 2).toString (16)
        }
        return hex
    }

    const getOTP = (secret) => {
        secret = secret.replace (' ', '') // support 2fa-secrets with spaces like "4TDV WOGO" → "4TDVWOGO"
        const epoch = Math.round (new Date ().getTime () / 1000.0)
        const time = leftpad (dec2hex (Math.floor (epoch / 30)), '0000000000000000')
        const hmacRes = hmac (CryptoJS.enc.Hex.parse (time), CryptoJS.enc.Hex.parse (base32tohex (secret)), 'sha1', 'hex')
        const offset = hex2dec (hmacRes.substring (hmacRes.length - 1))
        let otp = (hex2dec (hmacRes.substr (offset * 2, 8)) & hex2dec ('7fffffff')) + ''
        otp = (otp).substr (otp.length - 6, 6)
        return otp
    }

    return getOTP (secret)
}

/*  ------------------------------------------------------------------------ */

module.exports = {
    hash,
    hmac,
    jwt,
    totp,
}

/*  ------------------------------------------------------------------------ */
