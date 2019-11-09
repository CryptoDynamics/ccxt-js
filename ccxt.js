"use strict";

/*

MIT License

Copyright (c) 2017 Igor Kroitor

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

//-----------------------------------------------------------------------------

const Exchange  = require ('./js/base/Exchange')
    , functions = require ('./js/base/functions')
    , errors    = require ('./js/base/errors');

//-----------------------------------------------------------------------------
// this is updated by vss.js when building

const version = '1.18.714';

Exchange.ccxtVersion = version;

//-----------------------------------------------------------------------------

const exchanges = {
    'binance':                 require ('./js/binance.js'),
    'bitfinex':                require ('./js/bitfinex.js'),
    'bitfinex2':               require ('./js/bitfinex2.js'),
    'coinbase':                require ('./js/coinbase.js'),
    'hitbtc':                  require ('./js/hitbtc.js'),
    'hitbtc2':                 require ('./js/hitbtc2.js'),
    'liquid':                  require ('./js/liquid.js'),
    'livecoin':                require ('./js/livecoin.js'),
    'poloniex':                require ('./js/poloniex.js'),
};

//-----------------------------------------------------------------------------

module.exports = Object.assign({version, Exchange, exchanges: Object.keys(exchanges)}, exchanges, functions, errors);

//-----------------------------------------------------------------------------
