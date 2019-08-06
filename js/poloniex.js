'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ExchangeNotAvailable, RequestTimeout, AuthenticationError, PermissionDenied, DDoSProtection, InsufficientFunds, OrderNotFound, OrderNotCached, InvalidOrder, AccountSuspended, CancelPending, InvalidNonce } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class poloniex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'poloniex',
            'name': 'Poloniex',
            'countries': [ 'US' ],
            'rateLimit': 1000, // up to 6 calls per second
            'certified': true, // 2019-06-07
            'has': {
                'CORS': false,
                'createDepositAddress': true,
                'createMarketOrder': false,
                'editOrder': true,
                'fetchClosedOrders': 'emulated',
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrder': true, // true endpoint for a single open order
                'fetchOpenOrders': true, // true endpoint for open orders
                'fetchOrder': 'emulated', // no endpoint for a single open-or-closed order (just for an open order only)
                'fetchOrderBooks': true,
                'fetchOrders': 'emulated', // no endpoint for open-or-closed orders (just for open orders only)
                'fetchOrderStatus': 'emulated', // no endpoint for status of a single open-or-closed order (just for open orders only)
                'fetchOrderTrades': true, // true endpoint for trades of a single open or closed order
                'fetchTickers': true,
                'fetchTradingFee': true,
                'fetchTradingFees': true,
                'fetchTransactions': true,
                'fetchWithdrawals': true,
                'cancelAllOrders': true,
                'withdraw': true,
            },
            'timeframes': {
                '5m': 300,
                '15m': 900,
                '30m': 1800,
                '2h': 7200,
                '4h': 14400,
                '1d': 86400,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766817-e9456312-5ee6-11e7-9b3c-b628ca5626a5.jpg',
                'api': {
                    'public': 'https://poloniex.com/public',
                    'private': 'https://poloniex.com/tradingApi',
                },
                'www': 'https://www.poloniex.com',
                'doc': 'https://docs.poloniex.com',
                'fees': 'https://poloniex.com/fees',
                'referral': 'https://www.poloniex.com/?utm_source=ccxt&utm_medium=web',
            },
            'api': {
                'public': {
                    'get': [
                        'return24hVolume',
                        'returnChartData',
                        'returnCurrencies',
                        'returnLoanOrders',
                        'returnOrderBook',
                        'returnTicker',
                        'returnTradeHistory',
                    ],
                },
                'private': {
                    'post': [
                        'buy',
                        'cancelLoanOffer',
                        'cancelOrder',
                        'cancelAllOrders',
                        'closeMarginPosition',
                        'createLoanOffer',
                        'generateNewAddress',
                        'getMarginPosition',
                        'marginBuy',
                        'marginSell',
                        'moveOrder',
                        'returnActiveLoans',
                        'returnAvailableAccountBalances',
                        'returnBalances',
                        'returnCompleteBalances',
                        'returnDepositAddresses',
                        'returnDepositsWithdrawals',
                        'returnFeeInfo',
                        'returnLendingHistory',
                        'returnMarginAccountSummary',
                        'returnOpenLoanOffers',
                        'returnOpenOrders',
                        'returnOrderTrades',
                        'returnOrderStatus',
                        'returnTradableBalances',
                        'returnTradeHistory',
                        'sell',
                        'toggleAutoRenew',
                        'transferBalance',
                        'withdraw',
                    ],
                },
            },
            // Fees are tier-based. More info: https://poloniex.com/fees/
            // Rates below are highest possible.
            'fees': {
                'trading': {
                    'maker': 0.001,
                    'taker': 0.002,
                },
                'funding': {},
            },
            'limits': {
                'amount': {
                    'min': 0.000001,
                    'max': 1000000000,
                },
                'price': {
                    'min': 0.00000001,
                    'max': 1000000000,
                },
                'cost': {
                    'min': 0.00000000,
                    'max': 1000000000,
                },
            },
            'precision': {
                'amount': 8,
                'price': 8,
            },
            'commonCurrencies': {
                'AIR': 'AirCoin',
                'APH': 'AphroditeCoin',
                'BCC': 'BTCtalkcoin',
                'BDG': 'Badgercoin',
                'BTM': 'Bitmark',
                'CON': 'Coino',
                'GOLD': 'GoldEagles',
                'GPUC': 'GPU',
                'HOT': 'Hotcoin',
                'ITC': 'Information Coin',
                'PLX': 'ParallaxCoin',
                'KEY': 'KEYCoin',
                'STR': 'XLM',
                'SOC': 'SOCC',
                'XAP': 'API Coin',
            },
            'options': {
                'limits': {
                    'cost': {
                        'min': {
                            'BTC': 0.0001,
                            'ETH': 0.0001,
                            'XMR': 0.0001,
                            'USDT': 1.0,
                        },
                    },
                },
            },
            'exceptions': {
                'exact': {
                    'You may only place orders that reduce your position.': InvalidOrder,
                    'Invalid order number, or you are not the person who placed the order.': OrderNotFound,
                    'Permission denied': PermissionDenied,
                    'Connection timed out. Please try again.': RequestTimeout,
                    'Internal error. Please try again.': ExchangeNotAvailable,
                    'Order not found, or you are not the person who placed it.': OrderNotFound,
                    'Invalid API key/secret pair.': AuthenticationError,
                    'Please do not make more than 8 API calls per second.': DDoSProtection,
                    'Rate must be greater than zero.': InvalidOrder, // {"error":"Rate must be greater than zero."}
                },
                'broad': {
                    'Total must be at least': InvalidOrder, // {"error":"Total must be at least 0.0001."}
                    'This account is frozen.': AccountSuspended,
                    'Not enough': InsufficientFunds,
                    'Nonce must be greater': InvalidNonce,
                    'You have already called cancelOrder or moveOrder on this order.': CancelPending,
                    'Amount must be at least': InvalidOrder, // {"error":"Amount must be at least 0.000001."}
                    'is either completed or does not exist': InvalidOrder, // {"error":"Order 587957810791 is either completed or does not exist."}
                },
            },
        });
    }

    calculateFee (symbol, type, side, amount, price, takerOrMaker = 'taker', params = {}) {
        const market = this.markets[symbol];
        let key = 'quote';
        const rate = market[takerOrMaker];
        let cost = parseFloat (this.costToPrecision (symbol, amount * rate));
        if (side === 'sell') {
            cost *= price;
        } else {
            key = 'base';
        }
        return {
            'type': takerOrMaker,
            'currency': market[key],
            'rate': rate,
            'cost': parseFloat (this.feeToPrecision (symbol, cost)),
        };
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '5m', since = undefined, limit = undefined) {
        return [
            ohlcv['date'] * 1000,
            ohlcv['open'],
            ohlcv['high'],
            ohlcv['low'],
            ohlcv['close'],
            ohlcv['quoteVolume'],
        ];
    }

    async fetchOHLCV (symbol, timeframe = '5m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (since === undefined) {
            since = 0;
        }
        const request = {
            'currencyPair': market['id'],
            'period': this.timeframes[timeframe],
            'start': parseInt (since / 1000),
        };
        if (limit !== undefined) {
            request['end'] = this.sum (request['start'], limit * this.timeframes[timeframe]);
        } else {
            request['end'] = this.sum (this.seconds (), 1);
        }
        const response = await this.publicGetReturnChartData(this.extend(request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    async fetchMarkets (params = {}) {
        const markets = await this.publicGetReturnTicker();
        const keys = Object.keys (markets);
        const result = [];
        for (let i = 0; i < keys.length; i++) {
            const id = keys[i];
            const market = markets[id];
            const [ quoteId, baseId ] = id.split ('_');
            const base = this.commonCurrencyCode (baseId);
            const quote = this.commonCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const limits = this.extend (this.limits, {
                'cost': {
                    'min': this.safeValue (this.options['limits']['cost']['min'], quote),
                },
            });
            const isFrozen = this.safeString (market, 'isFrozen');
            const active = (isFrozen !== '1');
            result.push (this.extend (this.fees['trading'], {
                'id': id,
                'symbol': symbol,
                'baseId': baseId,
                'quoteId': quoteId,
                'base': base,
                'quote': quote,
                'active': active,
                'limits': limits,
                'info': market,
            }));
        }
        return result;
    }

    async fetchLendingSymbols(){
        let symbols = [];
        let lending_symbols = ["BTC", "BTS", "CLAM", "DOGE", "DASH", "LTC", "MAID", "STR", "USDT", "XMR", "XRP", "ETH", "FCT", "ETC", "EOS", "USDC", "BCHABC", "BCHSV", "ATOM"];
        lending_symbols.forEach(symbol => {
            symbols.push(this.commonCurrencyCode(symbol));
        });
        return symbols;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const request = {
            'account': 'all',
        };
        const response = await this.privatePostReturnCompleteBalances (this.extend (request, params));
        const result = {};
        const currencies = Object.keys (response);
        for (let i = 0; i < currencies.length; i++) {
            const currencyId = currencies[i];
            const balance = response[currencyId];
            const code = this.commonCurrencyCode (currencyId);
            const account = {
                'free': this.safeFloat (balance, 'available'),
                'used': this.safeFloat (balance, 'onOrders'),
                'total': 0.0,
            };
            account['total'] = this.sum (account['free'], account['used']);
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchWalletBalance () {
        // return await this.privatePostReturnCompleteBalances(this.extend ({ 'account': 'all' })); //{"status":"success","code":200,"data":{"1CR":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"ABY":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"AC":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"ACH":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"ADN":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"AEON":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"AERO":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"AIR":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"AMP":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"APH":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"ARCH":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"ARDR":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"ATOM":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"AUR":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"AXIS":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"BALLS":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"BANK":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"BAT":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"BBL":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"BBR":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"BCC":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"BCH":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"BCHABC":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"BCHSV":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"BCN":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"BCY":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"BDC":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"BDG":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"BELA":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"BITCNY":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"BITS":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"BITUSD":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"BLK":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"BLOCK":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"BLU":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"BNS":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"BNT":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"BONES":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"BOST":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"BTC":{"available":"0.00000000","onOrders":"0.00888463","btcValue":"0.00888463"},"BTCD":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"BTCS":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"BTM":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"BTS":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"BURN":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"BURST":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"C2":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"CACH":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"CAI":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"CC":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"CCN":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"CGA":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"CHA":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"CINNI":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"CLAM":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"CNL":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"CNMT":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"CNOTE":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"COMM":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"CON":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"CORG":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"CRYPT":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"CURE":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"CVC":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"CYC":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"DAO":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"DASH":{"available":"0.00000000","onOrders":"0.17670156","btcValue":"0.00194895"},"DCR":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"DGB":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"DICE":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"DIEM":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"DIME":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"DIS":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"DNS":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"DOGE":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"DRKC":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"DRM":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"DSH":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"DVK":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"EAC":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"EBT":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"ECC":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"EFL":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"EMC2":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"EMO":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"ENC":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"EOS":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"ETC":{"available":"0.00000000","onOrders":"12.83836398","btcValue":"0.00741646"},"ETH":{"available":"0.00000000","onOrders":"1.54361170","btcValue":"0.03290273"},"eTOK":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"EXE":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"EXP":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"FAC":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"FCN":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"FCT":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"FIBRE":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"FLAP":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"FLDC":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"FLO":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"FLT":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"FOAM":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"FOX":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"FRAC":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"FRK":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"FRQ":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"FVZ":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"FZ":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"FZN":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"GAME":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"GAP":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"GAS":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"GDN":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"GEMZ":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"GEO":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"GIAR":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"GLB":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"GML":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"GNO":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"GNS":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"GNT":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"GOLD":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"GPC":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"GPUC":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"GRC":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"GRCX":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"GRIN":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"GRS":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"GUE":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"H2O":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"HIRO":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"HOT":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"HUC":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"HUGE":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"HVC":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"HYP":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"HZ":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"IFC":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"INDEX":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"IOC":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"ITC":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"IXC":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"JLH":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"JPC":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"JUG":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"KDC":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"KEY":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"KNC":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"LBC":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"LC":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"LCL":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"LEAF":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"LGC":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"LOL":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"LOOM":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"LOVE":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"LPT":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"LQD":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"LSK":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"LTBC":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"LTC":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"LTCX":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"MAID":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"MANA":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"MAST":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"MAX":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"MCN":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"MEC":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"METH":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"MIL":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"MIN":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"MINT":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"MMC":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"MMNXT":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"MMXIV":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"MNTA":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"MON":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"MRC":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"MRS":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"MTS":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"MUN":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"MYR":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"MZC":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"N5X":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"NAS":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"NAUT":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"NAV":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"NBT":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"NEOS":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"NL":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"NMC":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"NMR":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"NOBL":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"NOTE":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"NOXT":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"NRS":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"NSR":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"NTX":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"NXC":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"NXT":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"NXTI":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"OMG":{"available":"0.00000000","onOrders":"65.51233110","btcValue":"0.00990218"},"OMNI":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"OPAL":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"PAND":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"PASC":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"PAWN":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"PIGGY":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"PINK":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"PLX":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"PMC":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"POLY":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"POT":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"PPC":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"PRC":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"PRT":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"PTS":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"Q2C":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"QBK":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"QCN":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"QORA":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"QTL":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"QTUM":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"RADS":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"RBY":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"RDD":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"REP":{"available":"0.00000000","onOrders":"26.64430190","btcValue":"0.03179144"},"RIC":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"RZR":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"SBD":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"SC":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"SDC":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"SHIBE":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"SHOPX":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"SILK":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"SJCX":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"SLR":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"SMC":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"SNT":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"SOC":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"SPA":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"SQL":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"SRCC":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"SRG":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"SSD":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"STEEM":{"available":"0.00000000","onOrders":"284.45507303","btcValue":"0.00663064"},"STORJ":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"STR":{"available":"6.30369655","onOrders":"5055.95225328","btcValue":"0.04424411"},"STRAT":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"SUM":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"SUN":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"SWARM":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"SXC":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"SYNC":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"SYS":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"TAC":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"TOR":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"TRUST":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"TWE":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"UIS":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"ULTC":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"UNITY":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"URO":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"USDC":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"USDE":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"USDT":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"UTC":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"UTIL":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"UVC":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"VIA":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"VOOT":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"VOX":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"VRC":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"VTC":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"WC":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"WDC":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"WIKI":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"WOLF":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"X13":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"XAI":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"XAP":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"XBC":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"XC":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"XCH":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"XCN":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"XCP":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"XCR":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"XDN":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"XDP":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"XEM":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"XHC":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"XLB":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"XMG":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"XMR":{"available":"0.00000000","onOrders":"1.40652299","btcValue":"0.01106279"},"XPB":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"XPM":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"XRP":{"available":"0.00000000","onOrders":"13.64310780","btcValue":"0.00042116"},"XSI":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"XST":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"XSV":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"XUSD":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"XVC":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"XXC":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"YACC":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"YANG":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"YC":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"YIN":{"available":"0.00000000","onOrders":"0.00000000","btcValue":"0.00000000"},"ZEC":{"available":"0.00000000","onOrders":"3.06605577","btcValue":"0.02210666"},"ZRX":{"available":"0.00000000","onOrders":"143.73211824","btcValue":"0.00330583"}}}
        const available = await this.privatePostReturnAvailableAccountBalances();

        let wallets = {'exchange': {}, 'margin': {}, 'lending': {}, 'total': {}};
        let on_orders = {'exchange': {}, 'margin': {}, 'lending': {}};
        let active_loans = await this.fetchActiveLoans();
        // let open_loans = await this.fetchOpenLoans();
        active_loans.forEach(loan => {
            loan.symbol = this.commonCurrencyCode(loan.symbol);
            if (loan.symbol in on_orders['lending']){
                on_orders['lending'][loan.symbol] += loan.amount;
            }else{
                on_orders['lending'][loan.symbol] = loan.amount;
            }
        });
        // Object.keys(open_loans).forEach(symbol => {
        //     open_loans[symbol].forEach(loan => {
        //         if (loan.symbol in on_orders['lending']){
        //             on_orders['lending'][loan.symbol] += loan.amount;
        //         }else{
        //             on_orders['lending'][loan.symbol] = loan.amount;
        //         }
        //     });
        // });

        Object.keys (available).forEach ( wallet => {
            Object.keys (available[wallet]).forEach ( symbol => {
                symbol = this.commonCurrencyCode(symbol);
                if (!(symbol in wallets[wallet])){
                    wallets[wallet][symbol] = {available: 0, on_orders: 0, total: 0};
                }
                wallets[wallet][symbol].available = parseFloat(available[wallet][symbol]);
                wallets[wallet][symbol].total += wallets[wallet][symbol].available;
                if (!(symbol in wallets.total)){
                    wallets.total[symbol] = 0;
                }
                wallets.total[symbol] += wallets[wallet][symbol].total;
            });
            Object.keys (on_orders[wallet]).forEach ( symbol => {
                symbol = this.commonCurrencyCode(symbol);
                if (!(symbol in wallets[wallet])){
                    wallets[wallet][symbol] = {available: 0, on_orders: 0, total: 0};
                }
                wallets[wallet][symbol].on_orders = on_orders[wallet][symbol];
                wallets[wallet][symbol].total += wallets[wallet][symbol].on_orders;
                if (!(symbol in wallets.total)){
                    wallets.total[symbol] = 0;
                }
                wallets.total[symbol] += wallets[wallet][symbol].total;
            });
        });

        return wallets;
    }

    async fetchLoanBalance () {
        const response = await this.privatePostReturnAvailableAccountBalances (this.extend ({ 'account': 'lending' }));
        const balances = {};
        if (!('lending' in response)) return balances;
        Object.keys (response.lending).forEach ((symbol) => {
            balances[symbol] = parseFloat (response['lending'][symbol]);
        });
        return balances;
    }

    async fetchLoanBook (symbol, count = 1) {
        const response = await this.publicGetReturnLoanOrders (this.extend ({ 'currency': this.marketId(symbol) }));
        const offers = [];
        if (!('offers' in response)) return offers;
        response['offers'].forEach ((offer) => {
            if (offers.length >= count) {
                return false;
            }
            offers.push ({
                'rate': parseFloat (offer['rate']),
                'amount': parseFloat (offer['amount']),
            });
        });
        return offers;
    }

    async fetchLoanBooks(count = 1){
        let symbols = await this.fetchLendingSymbols();
        let books = {};
        symbols.forEach(symbol => {
            books[symbol] = await this.fetchLoanBook(symbol, count);
        });
        return books;
    }

    async fetchOpenLoans (symbol) {
        const response = await this.privatePostReturnOpenLoanOffers(this.extend({'currency': this.marketId(symbol)}));

        let offers = [];
        if (!(symbol in response)) {
            return offers;
        }
        response[symbol].forEach (offer => {
            offers.push({
                'order_id': offer['id'],
                'symbol': this.commonCurrencyCode(symbol),
                'rate': parseFloat (offer['rate']),
                'amount': parseFloat (offer['amount']),
                'duration': parseFloat (offer['duration']),
                'date': Date.parse(offer['date']) / 1000
            });
        });
        return offers;
    }

    async fetchActiveLoans () {
        const response = await this.privatePostReturnActiveLoans ();
        const offers = [];
        response['provided'].forEach ((offer) => {
            offers.push ({
                'order_id': offer['id'],
                'symbol': this.commonCurrencyCode(offer['currency']),
                'rate': parseFloat (offer['rate']),
                'amount': parseFloat (offer['amount']),
                'duration': parseFloat (offer['duration']),
                'date': Date.parse (offer['date']) / 1000
            });
        });
        return offers;
    }

    async fetchLoansHistory (start, end) {
        const response = await this.privatePostReturnLendingHistory (this.extend ({ 'start': start, 'end': end }));
        const offers = [];
        response.forEach ((offer) => {
            const per = 2;
            const earn = parseFloat (offer['earned']);
            const fee = earn * per / 100;
            offers.push ({
                'order_id': offer['id'],
                'symbol': this.commonCurrencyCode(offer['currency']),
                'rate': parseFloat (offer['rate']),
                'amount': parseFloat (offer['amount']),
                'duration': parseFloat (offer['duration']),
                'earned': earn - fee,
                'fee_asc': fee,
                'date': Date.parse (offer['close']) / 1000
            });
        });
        return offers;
    }

    async createLoanOrder (symbol, amount, rate, duration, renew = 0, params = {}) {
        const response = await this.privatePostCreateLoanOffer (this.extend ({
            'currency': this.marketId(symbol),
            'amount': amount,
            'duration': duration,
            'autoRenew': renew,
            'lendingRate': rate,
        }, params));
        return await this.parseLoanOrder (response);
    }

    async cancelLoanOrder (id, params = {}) {
        return await this.privatePostCancelLoanOffer (this.extend ({'orderNumber': id}, params));
    }

    async parseLoanOrder (data) {
        if (data['success']) {
            return { 'order_id': data['orderID'] };
        }
    }

    async transferBalance (symbol, amount, from, to) {
        const response = await this.privatePostTransferBalance (this.extend ( {
            'currency': this.marketId(symbol),
            'amount': amount,
            'fromAccount': from,
            'toAccount': to } ));
        return response;
    }

    async fetchTradingFees (params = {}) {
        await this.loadMarkets ();
        const fees = await this.privatePostReturnFeeInfo (params);
        return {
            'info': fees,
            'maker': this.safeFloat (fees, 'makerFee'),
            'taker': this.safeFloat (fees, 'takerFee'),
            'withdraw': {},
            'deposit': {},
        };
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'currencyPair': this.marketId (symbol),
        };
        if (limit !== undefined) {
            request['depth'] = limit; // 100
        }
        const response = await this.publicGetReturnOrderBook (this.extend (request, params));
        const orderbook = this.parseOrderBook (response);
        orderbook['nonce'] = this.safeInteger (response, 'seq');
        return orderbook;
    }

    async fetchOrderBooks (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'currencyPair': 'all',
        };

        const response = await this.publicGetReturnOrderBook (this.extend (request, params));
        const marketIds = Object.keys (response);
        const result = {};
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            let symbol = undefined;
            if (marketId in this.markets_by_id) {
                symbol = this.markets_by_id[marketId]['symbol'];
            } else {
                const [ quoteId, baseId ] = marketId.split ('_');
                const base = this.commonCurrencyCode (baseId);
                const quote = this.commonCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
            const orderbook = this.parseOrderBook (response[marketId]);
            orderbook['nonce'] = this.safeInteger (response[marketId], 'seq');
            result[symbol] = orderbook;
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        const timestamp = this.milliseconds ();
        let symbol = undefined;
        if (market) {
            symbol = market['symbol'];
        }
        let open = undefined;
        let change = undefined;
        let average = undefined;
        const last = this.safeFloat (ticker, 'last');
        const relativeChange = this.safeFloat (ticker, 'percentChange');
        if (relativeChange !== -1) {
            open = last / this.sum (1, relativeChange);
            change = last - open;
            average = this.sum (last, open) / 2;
        }
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high24hr'),
            'low': this.safeFloat (ticker, 'low24hr'),
            'bid': this.safeFloat (ticker, 'highestBid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'lowestAsk'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': relativeChange * 100,
            'average': average,
            'baseVolume': this.safeFloat (ticker, 'quoteVolume'),
            'quoteVolume': this.safeFloat (ticker, 'baseVolume'),
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetReturnTicker (params);
        const ids = Object.keys (response);
        const result = {};
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            let symbol = undefined;
            let market = undefined;
            if (id in this.markets_by_id) {
                market = this.markets_by_id[id];
                symbol = market['symbol'];
            } else {
                const [ quoteId, baseId ] = id.split ('_');
                const base = this.commonCurrencyCode (baseId);
                const quote = this.commonCurrencyCode (quoteId);
                symbol = base + '/' + quote;
                market = { 'symbol': symbol };
            }
            const ticker = response[id];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetReturnCurrencies (params);
        const ids = Object.keys (response);
        const result = {};
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const currency = response[id];
            // todo: will need to rethink the fees
            // to add support for multiple withdrawal/deposit methods and
            // differentiated fees for each particular method
            const precision = 8; // default precision, todo: fix "magic constants"
            const code = this.commonCurrencyCode (id);
            const active = (currency['delisted'] === 0) && !currency['disabled'];
            result[code] = {
                'id': id,
                'code': code,
                'name': currency['name'],
                'active': active,
                'fee': this.safeFloat (currency, 'txFee'), // todo: redesign
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -precision),
                        'max': Math.pow (10, precision),
                    },
                    'price': {
                        'min': Math.pow (10, -precision),
                        'max': Math.pow (10, precision),
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': currency['txFee'],
                        'max': Math.pow (10, precision),
                    },
                },
            };
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const response = await this.publicGetReturnTicker (params);
        const ticker = response[market['id']];
        return this.parseTicker (ticker, market);
    }

    parseTrade (trade, market = undefined) {
        const id = this.safeString (trade, 'globalTradeID');
        const orderId = this.safeString (trade, 'orderNumber');
        const timestamp = this.parse8601 (this.safeString (trade, 'date'));
        let symbol = undefined;
        let base = undefined;
        let quote = undefined;
        if ((!market) && ('currencyPair' in trade)) {
            const currencyPair = trade['currencyPair'];
            if (currencyPair in this.markets_by_id) {
                market = this.markets_by_id[currencyPair];
            } else {
                const parts = currencyPair.split ('_');
                quote = parts[0];
                base = parts[1];
                symbol = base + '/' + quote;
            }
        }
        if (market !== undefined) {
            symbol = market['symbol'];
            base = market['base'];
            quote = market['quote'];
        }
        const side = this.safeString (trade, 'type');
        let fee = undefined;
        const price = this.safeFloat (trade, 'rate');
        const total = this.safeFloat (trade, 'total');
        const amount = this.safeFloat (trade, 'amount');
        let filled = amount;
        let cost = total;
        let feeCost = 0;
        let feeAmount = 0;
        if ('fee' in trade) {
            const rate = this.safeFloat (trade, 'fee');
            let currency = undefined;
            if (side === 'buy') {
                currency = base;
                feeAmount = this.feeToPrecision(symbol, amount * rate);
                filled = amount - feeAmount;
            } else {
                currency = quote;
                if (total !== undefined) {
                    feeCost = this.feeToPrecision(symbol, total * rate);
                    cost = total - feeCost;
                }
            }
            fee = {
                'type': undefined,
                'rate': rate,
                'cost': feeCost,
                'amount': feeAmount,
                'currency': currency,
            };
        }
        return {
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': orderId,
            'type': 'limit',
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'total': total,
            'filled': filled,
            'fee': fee,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'currencyPair': market['id'],
        };
        if (since !== undefined) {
            request['start'] = parseInt (since / 1000);
            request['end'] = this.seconds (); // last 50000 trades by default
        }
        const trades = await this.publicGetReturnTradeHistory (this.extend (request, params));
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const pair = market ? market['id'] : 'all';
        const request = { 'currencyPair': pair };
        if (since !== undefined) {
            request['start'] = parseInt (since / 1000);
            request['end'] = this.seconds () + 1; // adding 1 is a fix for #3411
        }
        // limit is disabled (does not really work as expected)
        if (limit !== undefined) {
            request['limit'] = parseInt (limit);
        }
        const response = await this.privatePostReturnTradeHistory (this.extend (request, params));
        let result = [];
        if (market !== undefined) {
            result = this.parseTrades (response, market);
        } else {
            if (response) {
                const ids = Object.keys (response);
                for (let i = 0; i < ids.length; i++) {
                    const id = ids[i];
                    let market = undefined;
                    if (id in this.markets_by_id) {
                        market = this.markets_by_id[id];
                        const trades = this.parseTrades (response[id], market);
                        for (let j = 0; j < trades.length; j++) {
                            result.push (trades[j]);
                        }
                    } else {
                        const [ quoteId, baseId ] = id.split ('_');
                        const base = this.commonCurrencyCode (baseId);
                        const quote = this.commonCurrencyCode (quoteId);
                        const symbol = base + '/' + quote;
                        const trades = response[id];
                        for (let j = 0; j < trades.length; j++) {
                            result.push (this.extend (this.parseTrade (trades[j]), {
                                'symbol': symbol,
                            }));
                        }
                    }
                }
            }
        }
        return this.filterBySinceLimit (result, since, limit);
    }

    parseOrderStatus (status) {
        const statuses = {
            'Open': 'open',
            'Partially filled': 'open',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        let timestamp = this.safeInteger (order, 'timestamp');
        if (!timestamp) {
            timestamp = this.parse8601 (order['date']);
        }
        let trades = undefined;
        if ('resultingTrades' in order) {
            trades = this.parseTrades (order['resultingTrades'], market);
        }
        let symbol = undefined;
        const marketId = this.safeString (order, 'currencyPair');
        market = this.safeValue (this.markets_by_id, marketId, market);
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const price = this.safeFloat2 (order, 'price', 'rate');
        const remaining = this.safeFloat (order, 'amount');
        const amount = this.safeFloat (order, 'startingAmount', remaining);
        let filled = undefined;
        let cost = 0;
        if (amount !== undefined) {
            if (remaining !== undefined) {
                filled = amount - remaining;
                if (price !== undefined) {
                    cost = filled * price;
                }
            }
        }
        if (filled === undefined) {
            if (trades !== undefined) {
                filled = 0;
                cost = 0;
                for (let i = 0; i < trades.length; i++) {
                    const trade = trades[i];
                    const tradeAmount = trade['amount'];
                    const tradePrice = trade['price'];
                    filled = this.sum (filled, tradeAmount);
                    cost += tradePrice * tradeAmount;
                }
            }
        }
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        let type = this.safeString (order, 'type');
        const side = this.safeString (order, 'side', type);
        if (type === side) {
            type = undefined;
        }
        const id = this.safeString (order, 'orderNumber');
        return {
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'trades': trades,
            'fee': undefined,
        };
    }

    parseOpenOrders (orders, market, result) {
        for (let i = 0; i < orders.length; i++) {
            const order = orders[i];
            const extended = this.extend (order, {
                'status': 'open',
                'type': 'limit',
                'side': order['type'],
                'price': order['rate'],
            });
            result.push (this.parseOrder (extended, market));
        }
        return result;
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const pair = market ? market['id'] : 'all';
        const request = {
            'currencyPair': pair,
        };
        const response = await this.privatePostReturnOpenOrders (this.extend (request, params));
        let openOrders = [];
        if (market !== undefined) {
            openOrders = this.parseOpenOrders (response, market, openOrders);
        } else {
            const marketIds = Object.keys (response);
            for (let i = 0; i < marketIds.length; i++) {
                const marketId = marketIds[i];
                const orders = response[marketId];
                const m = this.markets_by_id[marketId];
                openOrders = this.parseOpenOrders (orders, m, openOrders);
            }
        }
        for (let j = 0; j < openOrders.length; j++) {
            this.orders[openOrders[j]['id']] = openOrders[j];
        }
        const openOrdersIndexedById = this.indexBy (openOrders, 'id');
        const cachedOrderIds = Object.keys (this.orders);
        const result = [];
        for (let k = 0; k < cachedOrderIds.length; k++) {
            const id = cachedOrderIds[k];
            if (id in openOrdersIndexedById) {
                this.orders[id] = this.extend (this.orders[id], openOrdersIndexedById[id]);
            } else {
                let order = this.orders[id];
                if (order['status'] === 'open') {
                    order = this.extend (order, {
                        'status': 'closed',
                        'cost': undefined,
                        'filled': order['amount'],
                        'remaining': 0.0,
                    });
                    if (order['cost'] === undefined) {
                        if (order['filled'] !== undefined) {
                            order['cost'] = order['filled'] * order['price'];
                        }
                    }
                    this.orders[id] = order;
                }
            }
            const order = this.orders[id];
            if (market !== undefined) {
                if (order['symbol'] === symbol) {
                    result.push (order);
                }
            } else {
                result.push (order);
            }
        }
        return this.filterBySinceLimit (result, since, limit);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        id = id.toString ();
        const response = await this.privatePostReturnOrderStatus (this.extend ({
            'orderNumber': id,
        }, params));
        const result = this.safeValue (response['result'], id);
        if (result === undefined) {
            let trades = await this.fetchOrderTrades(id, symbol);

            if (trades.length){
                let amount = 0;
                let cost = 0;
                let filled = 0;
                let total = 0;
                let feeCost = 0;
                let feeAmount = 0;
                let price = 0;
                trades.forEach(trade => {
                    amount += trade['amount'];
                    cost += trade['cost'];
                    filled += trade['filled'];
                    total += trade['total'];
                    price += trade['price'];
                    feeCost += trade['fee']['cost'];
                    feeAmount += parseFloat(trade['fee']['amount']);
                });

                price = price / trades.length;

                let order = {
                    'id': id,
                    'timestamp': trades[trades.length - 1]['timestamp'],
                    'datetime': trades[trades.length - 1]['datetime'],
                    'lastTradeTimestamp': trades[trades.length - 1]['timestamp'],
                    'status': 'closed',
                    'symbol': trades[0]['symbol'],
                    'type': trades[0]['type'],
                    'side': trades[0]['side'],
                    'price': price,
                    'cost': cost,
                    'total': total,
                    'amount': amount,
                    'filled': filled,
                    'remaining': 0,
                    'trades': trades,
                    'feeAmount': feeAmount,
                    'feeCost': feeCost,
                };
                return order;
            }else {
                return [];
            }
        }else{
            const order = this.parseOrder (result);
            order['id'] = id;
            this.orders[id] = order;
            return order;
        }
    }

    filterOrdersByStatus (orders, status) {
        const result = [];
        for (let i = 0; i < orders.length; i++) {
            if (orders[i]['status'] === status) {
                result.push (orders[i]);
            }
        }
        return result;
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const orders = await this.fetchOrders (symbol, since, limit, params);
        return this.filterOrdersByStatus (orders, 'open');
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const orders = await this.fetchOrders (symbol, since, limit, params);
        return this.filterOrdersByStatus (orders, 'closed');
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type === 'market') {
            throw new ExchangeError (this.id + ' allows limit orders only');
        }
        await this.loadMarkets ();
        const method = 'privatePost' + this.capitalize (side);
        const market = this.market (symbol);
        const request = {
            'currencyPair': market['id'],
            'rate': this.priceToPrecision (symbol, price),
            'amount': this.amountToPrecision (symbol, amount),
        };
        const response = await this[method] (this.extend (request, params));
        const timestamp = this.milliseconds ();
        let order = this.parseOrder (this.extend ({
            'timestamp': timestamp,
            'status': 'open',
            'type': type,
            'side': side,
            'price': price,
            'amount': amount
        }, response), market);
        const id = order['id'];
        this.orders[id] = order;
        return this.extend (order);
    }

    async editOrder (id, symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        price = parseFloat (price);
        const request = {
            'orderNumber': id,
            'rate': this.priceToPrecision (symbol, price),
        };
        if (amount !== undefined) {
            request['amount'] = this.amountToPrecision (symbol, amount);
        }
        const response = await this.privatePostMoveOrder (this.extend (request, params));
        let result = undefined;
        if (id in this.orders) {
            this.orders[id]['status'] = 'canceled';
            const newid = response['orderNumber'];
            this.orders[newid] = this.extend (this.orders[id], {
                'id': newid,
                'price': price,
                'status': 'open',
            });
            if (amount !== undefined) {
                this.orders[newid]['amount'] = amount;
            }
            result = this.extend (this.orders[newid], { 'info': response });
        } else {
            let market = undefined;
            if (symbol !== undefined) {
                market = this.market (symbol);
            }
            result = this.parseOrder (response, market);
            this.orders[result['id']] = result;
        }
        return result;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = undefined;
        try {
            response = await this.privatePostCancelOrder (this.extend ({
                'orderNumber': id,
            }, params));
        } catch (e) {
            if (e instanceof CancelPending) {
                // A request to cancel the order has been sent already.
                // If we then attempt to cancel the order the second time
                // before the first request is processed the exchange will
                // throw a CancelPending exception. Poloniex won't show the
                // order in the list of active (open) orders and the cached
                // order will be marked as 'closed' (see #1801 for details).
                // To avoid that we proactively mark the order as 'canceled'
                // here. If for some reason the order does not get canceled
                // and still appears in the active list then the order cache
                // will eventually get back in sync on a call to `fetchOrder`.
                if (id in this.orders) {
                    this.orders[id]['status'] = 'canceled';
                }
            }
            throw e;
        }
        if (id in this.orders) {
            this.orders[id]['status'] = 'canceled';
        }
        return response;
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['currencyPair'] = market['id'];
        }
        const response = await this.privatePostCancelAllOrders (this.extend (request, params));
        const orderIds = this.safeValue (response, 'orderNumbers', []);
        for (let i = 0; i < orderIds.length; i++) {
            const id = orderIds[i].toString ();
            if (id in this.orders) {
                this.orders[id]['status'] = 'canceled';
            }
        }
        return response;
    }

    async fetchOpenOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        id = id.toString ();
        const response = await this.privatePostReturnOrderStatus (this.extend ({
            'orderNumber': id,
        }, params));
        const result = this.safeValue (response['result'], id);
        if (result === undefined) {
            throw new OrderNotFound (this.id + ' order id ' + id + ' not found');
        }
        const order = this.parseOrder (result);
        order['id'] = id;
        this.orders[id] = order;
        return order;
    }

    async fetchOrderStatus (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const orders = await this.fetchOpenOrders (symbol, undefined, undefined, params);
        const indexed = this.indexBy (orders, 'id');
        return (id in indexed) ? 'open' : 'closed';
    }

    async fetchOrderTrades (id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'orderNumber': id,
        };
        const trades = await this.privatePostReturnOrderTrades (this.extend (request, params));
        return this.parseTrades (trades);
    }

    async createDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.privatePostGenerateNewAddress (this.extend (request, params));
        let address = undefined;
        let tag = undefined;
        if (response['success'] === 1) {
            address = this.safeString (response, 'response');
        }
        this.checkAddress (address);
        const depositAddress = this.safeString (currency['info'], 'depositAddress');
        if (depositAddress !== undefined) {
            tag = address;
            address = depositAddress;
        }
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'info': response,
        };
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const response = await this.privatePostReturnDepositAddresses (params);
        const currencyId = currency['id'];
        let address = this.safeString (response, currencyId);
        let tag = undefined;
        this.checkAddress (address);
        const depositAddress = this.safeString (currency['info'], 'depositAddress');
        if (depositAddress !== undefined) {
            tag = address;
            address = depositAddress;
        }
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'info': response,
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
            'amount': amount,
            'address': address,
        };
        if (tag) {
            request['paymentId'] = tag;
        }
        const response = await this.privatePostWithdraw (this.extend (request, params));
        return {
            'info': response,
            'id': response['response'],
        };
    }

    async fetchTransactionsHelper (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const year = 31104000; // 60 * 60 * 24 * 30 * 12 = one year of history, why not
        const now = this.seconds ();
        const start = (since !== undefined) ? parseInt (since / 1000) : now - 10 * year;
        const request = {
            'start': start, // UNIX timestamp, required
            'end': now, // UNIX timestamp, required
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privatePostReturnDepositsWithdrawals (this.extend (request, params));
        return response;
    }

    async fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.fetchTransactionsHelper (code, since, limit, params);
        for (let i = 0; i < response['deposits'].length; i++) {
            response['deposits'][i]['type'] = 'deposit';
        }
        for (let i = 0; i < response['withdrawals'].length; i++) {
            response['withdrawals'][i]['type'] = 'withdrawal';
        }
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        const withdrawals = this.parseTransactions (response['withdrawals'], currency, since, limit);
        const deposits = this.parseTransactions (response['deposits'], currency, since, limit);
        const transactions = this.arrayConcat (deposits, withdrawals);
        return this.filterByCurrencySinceLimit (this.sortBy (transactions, 'timestamp'), code, since, limit);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        const response = await this.fetchTransactionsHelper (code, since, limit, params);
        for (let i = 0; i < response['withdrawals'].length; i++) {
            response['withdrawals'][i]['type'] = 'withdrawal';
        }
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        const withdrawals = this.parseTransactions (response['withdrawals'], currency, since, limit);
        return this.filterByCurrencySinceLimit (withdrawals, code, since, limit);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        const response = await this.fetchTransactionsHelper (code, since, limit, params);
        for (let i = 0; i < response['deposits'].length; i++) {
            response['deposits'][i]['type'] = 'deposit';
        }
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        const deposits = this.parseTransactions (response['deposits'], currency, since, limit);
        return this.filterByCurrencySinceLimit (deposits, code, since, limit);
    }

    parseTransactionStatus (status) {
        const statuses = {
            'COMPLETE': 'ok',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        let timestamp = this.safeInteger (transaction, 'timestamp');
        if (timestamp !== undefined) {
            timestamp = timestamp * 1000;
        }
        let code = undefined;
        const currencyId = this.safeString (transaction, 'currency');
        currency = this.safeValue (this.currencies_by_id, currencyId);
        if (currency === undefined) {
            code = this.commonCurrencyCode (currencyId);
        }
        if (currency !== undefined) {
            code = currency['code'];
        }
        let status = this.safeString (transaction, 'status', 'pending');
        let txid = this.safeString (transaction, 'txid');
        if (status !== undefined) {
            const parts = status.split (': ');
            const numParts = parts.length;
            status = parts[0];
            if ((numParts > 1) && (txid === undefined)) {
                txid = parts[1];
            }
            status = this.parseTransactionStatus (status);
        }
        const type = this.safeString (transaction, 'type');
        const id = this.safeString2 (transaction, 'withdrawalNumber', 'depositNumber');
        let amount = this.safeFloat (transaction, 'amount');
        const address = this.safeString (transaction, 'address');
        let feeCost = this.safeFloat (transaction, 'fee');
        if (feeCost === undefined) {
            // according to https://poloniex.com/fees/
            feeCost = 0; // FIXME: remove hardcoded value that may change any time
        }
        if (type === 'withdrawal') {
            // poloniex withdrawal amount includes the fee
            amount = amount - feeCost;
        }
        return {
            'info': transaction,
            'id': id,
            'currency': code,
            'amount': amount,
            'address': address,
            'tag': undefined,
            'status': status,
            'type': type,
            'updated': undefined,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fee': {
                'currency': code,
                'cost': feeCost,
            },
        };
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api];
        const query = this.extend ({ 'command': path }, params);
        if (api === 'public') {
            url += '?' + this.urlencode (query);
        } else {
            this.checkRequiredCredentials ();
            query['nonce'] = this.nonce ();
            body = this.urlencode (query);
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Key': this.apiKey,
                'Sign': this.hmac (this.encode (body), this.encode (this.secret), 'sha512'),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response) {
        if (response === undefined) {
            return;
        }
        // {"error":"Permission denied."}
        if ('error' in response) {
            const message = response['error'];
            const feedback = this.json (response);
            const exact = this.exceptions['exact'];
            if (message in exact) {
                throw new exact[message] (feedback);
            }
            const broad = this.exceptions['broad'];
            const broadKey = this.findBroadlyMatchedKey (broad, message);
            if (broadKey !== undefined) {
                throw new broad[broadKey] (feedback);
            }
            throw new ExchangeError (feedback); // unknown message
        }
    }
};
