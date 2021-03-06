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
                'loan': true
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
        await this.loadMarkets ();
        let symbols = [];
        let lending_symbols = ['BTC', 'BTS', 'CLAM', 'DOGE', 'DASH', 'LTC', 'MAID', 'STR', 'USDT', 'XMR', 'XRP', 'ETH', 'FCT', 'ETC', 'EOS', 'USDC', 'BCHABC', 'BCHSV', 'ATOM'];
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

    initSymbol(symbol, balances){
        if (symbol in balances) return;
        balances[symbol] = {
            exchange: {available: 0, on_orders: 0, total:0},
            margin: {available: 0, on_orders: 0, total:0},
            lending: {available: 0, on_orders: 0, total:0}
        };
    }

    async fetchWalletBalance () {
        let balances = {};

        //calc available
        const available = await this.privatePostReturnAvailableAccountBalances();
        Object.keys(available).forEach(wallet => {
           Object.keys(available[wallet]).forEach(symbol => {
               let currency = this.commonCurrencyCode(symbol);
               this.initSymbol(currency, balances);
               balances[currency][wallet].available += Number(available[wallet][symbol]);
           });
        });

        //calc on_orders in exchange
        const openOrdersBalances = await this.privatePostReturnCompleteBalances();
        Object.keys(openOrdersBalances).forEach(symbol => {
            let onOrders = Number(openOrdersBalances[symbol]['onOrders']);
            if (onOrders === 0) return;
            let currency = this.commonCurrencyCode(symbol);
            this.initSymbol(currency, balances);
            balances[currency]['exchange'].on_orders += onOrders;
        });

        //calc on_orders in lending
        let open_loans = await this.fetchOpenLoans();
        let active_loans = await this.fetchActiveLoans();
        const loans = open_loans.concat(active_loans);
        loans.forEach(offer => {
            this.initSymbol(offer.symbol, balances);
            balances[offer.symbol]['lending']['on_orders'] += Number(offer.amount);
        });

        //calc total
        Object.keys(balances).forEach(symbol => {
            Object.keys(balances[symbol]).forEach(wallet => {
                balances[symbol][wallet].total = balances[symbol][wallet].available + balances[symbol][wallet].on_orders;
            });
        });
        return balances;

        // open_orders.forEach(order => {
        //     let symbol = '';
        //     let amount = 0;
        //     if (order.side === 'sell'){
        //         symbol = order.symbol.split('/')[0];
        //         amount = Number(order.amount);
        //     }else {
        //         symbol = order.symbol.split('/')[1];
        //         amount = Number(order.amount) * Number(order.price);
        //     }

    }

    async fetchLoanBook (symbol, count = 1) {
        await this.loadMarkets ();
        const response = await this.publicGetReturnLoanOrders (this.extend ({
            'currency': this.currencyId(symbol)
        }));
        const offers = [];
        if (!('offers' in response)) return offers;
        response['offers'].forEach ((offer) => {
            if (offers.length >= count) {
                return false;
            }
            offers.push ({
                'rate': Number(offer['rate']),
                'amount': Number(offer['amount']),
            });
        });
        return offers;
    }

    async fetchOpenLoans (symbol=undefined) {
        await this.loadMarkets ();
        let currency = this.currencyId(symbol);
        const response = await this.privatePostReturnOpenLoanOffers(this.extend({'currency': currency}));

        let offers = [];

        if (symbol === undefined) {
            Object.keys(response).forEach(currencyId => {
                offers = offers.concat(this.parseOpenLoans(currencyId, response[currencyId]));
            });
        }else{
            if (currency in response){
                offers = offers.concat(this.parseOpenLoans(currency, response[currency]));
            }
        }
        return offers;
    }

    parseOpenLoans(symbol, symbolOpenLoans){
        let offers = [];
        symbolOpenLoans.forEach(offer => {
            offers.push({
                'id': offer['id'],
                'symbol': this.commonCurrencyCode(symbol),
                'rate': Number(offer['rate']),
                'amount': Number (offer['amount']),
                'duration': Number (offer['duration']),
                'timestamp': Date.parse(offer['date'])
            });
        });
        return offers;
    }

    async fetchActiveLoans (symbol=undefined) {
        const response = await this.privatePostReturnActiveLoans();
        const offers = [];
        response['provided'].forEach (offer => {
            let currency =  this.commonCurrencyCode(offer['currency']);
            if (symbol === undefined || currency === symbol) {
                offers.push({
                    'id': offer['id'],
                    'symbol': currency,
                    'rate': Number(offer['rate']),
                    'amount': Number(offer['amount']),
                    'duration': Number(offer['duration']),
                    'timestamp': Date.parse(offer['date'])
                });
            }
        });
        return offers;
    }

    async fetchLoansHistory(from, to) {
        const response = await this.privatePostReturnLendingHistory(this.extend({
            'start': from / 1000,
            'end': to / 1000
        }));
        const offers = [];
        response.forEach ((offer) => {
            offers.push ({
                'id': offer['id'],
                'symbol': this.commonCurrencyCode(offer['currency']),
                'rate': Number(offer['rate']),
                'amount': Number (offer['amount']),
                'duration': Number (offer['duration']),
                'earned': Number(offer['earned']),
                'timestamp': Date.parse(offer['close'])
            });
        });
        return offers;
    }

    async createLoanOrder (symbol, amount, rate, duration, renew = 0, params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostCreateLoanOffer (this.extend ({
            'currency': this.currencyId(symbol),
            'amount': amount,
            'duration': duration,
            'autoRenew': renew,
            'lendingRate': rate,
        }, params));

        return {
            id: response.orderID,
            symbol: symbol,
            amount: Number(amount),
            rate: Number(rate),
            duration: Number(duration),
            renew: Number(renew),
            timestamp: Math.round(Date.now())
        };
    }

    async cancelLoanOrder (id, params = {}) {
        let response = await this.privatePostCancelLoanOffer (this.extend ({'orderNumber': parseInt(id)}, params));
        return {
            timestamp: Math.round(Date.now()),
            amount: Number(response.amount)
        };
    }

    async transferBalance (symbol, amount, from, to) {
        await this.loadMarkets ();

        return await this.privatePostTransferBalance (this.extend ( {
            'currency': this.currencyId(symbol),
            'amount': amount,
            'fromAccount': from,
            'toAccount': to } ));
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
        return this.parseOrderBook (response);
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
            'quoteVolume': this.safeFloat (ticker, 'baseVolume')
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
        }
        const side = this.safeString (trade, 'type');
        const price = this.safeFloat (trade, 'rate');
        const cost = this.safeFloat (trade, 'total');
        const amount = this.safeFloat (trade, 'amount');
        const feePer = this.safeFloat (trade, 'fee');

        let fee = 0;

        if (side === 'buy') fee = amount * feePer;
        else if (side === 'sell') fee = cost * feePer;
        // fee = cost * feePer;

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
            'fee': fee
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

    async parseOrder (order, market = undefined) {
        await this.loadMarkets();
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
        let price = this.safeFloat2 (order, 'price', 'rate');
        const remaining = this.safeFloat (order, 'amount');
        const amount = this.safeFloat (order, 'startingAmount', remaining);
        let filled = undefined;
        let cost = 0;
        let fee = 0;
        let lastTradeTimestamp = undefined;

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
                let tradePrice = 0;
                trades.forEach(trade => {
                    const tradeAmount = trade['amount'];
                    const tradeCost = trade['cost'];
                    tradePrice += Number(trade['price']);
                    const tradeTimestamp = this.parse8601 (trade['date']);

                    filled = this.sum (filled, tradeAmount);
                    cost += tradeCost;
                    fee += Number(trade.fee);
                    if (lastTradeTimestamp < tradeTimestamp) lastTradeTimestamp = tradeTimestamp;
                });
                if (tradePrice)
                    price = tradePrice / trades.length;
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
            'lastTradeTimestamp': lastTradeTimestamp,
            'status': status,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': Number(this.priceToPrecision(symbol, price)),
            'cost': Number(this.costToPrecision(symbol, cost)),
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'trades': trades,
            'fee': Number(this.feeToPrecision(symbol, fee)),
        };
    }

    async parseOpenOrders (orders, market, result) {
        for (let order of orders){
            const extended = this.extend (order, {
                'status': 'open',
                'type': 'limit',
                'side': order['type'],
                'price': order['rate'],
            });
            result.push (await this.parseOrder (extended, market));
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
            openOrders = await this.parseOpenOrders (response, market, openOrders);
        } else {
            const marketIds = Object.keys (response);
            for (let i = 0; i < marketIds.length; i++) {
                const marketId = marketIds[i];
                const orders = response[marketId];
                const m = this.markets_by_id[marketId];
                openOrders = await this.parseOpenOrders (orders, m, openOrders);
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
        const response = await this.privatePostReturnOrderStatus (this.extend ({
            'orderNumber': id,
        }, params));
        const result = response['result'][id];
        let trades = undefined;
        try {
            trades = await this.privatePostReturnOrderTrades(this.extend({orderNumber: id}));
        }catch (e) {
            trades = undefined;
        }
        if (result === undefined) {
            if (trades !== undefined){
                let order = {};
                order.orderNumber = id;
                order.date = trades[0].date;
                order.currencyPair = trades[0].currencyPair;
                order.status = 'closed';
                order.type = trades[0].type;
                order.rate = Number(trades[0].rate);
                order.total = 0;
                order.startingAmount = 0;
                order.fee = trades[0].fee;

                trades.forEach(trade => {
                    trade.orderNumber = id;
                    order.total += Number(trade.total);
                    // order.amount += Number(trade.amount);
                    order.startingAmount += Number(trade.amount);
                });
                order.resultingTrades = trades;

                return await this.parseOrder(order);
            }else {
                return {
                    id: id,
                    status: 'canceled'
                };
            }
        }else{
            const order = await this.parseOrder (result);
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
        await this.loadMarkets();
        let market = this.market(symbol);
        let currencyPair = (market)? market.id: 'all';
        let request = {currencyPair: currencyPair};
        if (since) {
            request.start = since / 1000;
            request.end = this.seconds() + 1;
        }
        if (limit !== undefined) {
            request['limit'] = parseInt (limit);
        }
        const trades = await this.privatePostReturnTradeHistory(this.extend(request));
        let orders = {};

        if (market){
            orders = this.parseClosedOrdersTrades(market.id, trades);
        }else{
            Object.keys(trades).forEach(symbol => {
                orders = Object.assign({}, orders, this.parseClosedOrdersTrades(symbol, trades[symbol]));
            });
        }

        let parseOrders = [];
        for (const order of Object.values(orders)) {
            parseOrders.push(await this.parseOrder(order, market));
        }

        return this.filterBySinceLimit (parseOrders, since, limit);
    }

    parseClosedOrdersTrades(symbol, trades){
        let orders = {};
        trades.forEach(trade => {
            if (!(trade.orderNumber in orders))
                orders[trade.orderNumber] = {
                    orderNumber: trade.orderNumber,
                    date: trade.date,
                    currencyPair: symbol,
                    status: 'closed',
                    type: trade.type,
                    rate: Number(trade.rate),
                    // amount: 0,
                    total: 0,
                    startingAmount: 0,
                    resultingTrades: [],
                    fee: 0
                };
            orders[trade.orderNumber].total += Number(trade.total);
            // orders[trade.orderNumber].amount += Number(trade.amount);
            orders[trade.orderNumber].startingAmount += Number(trade.amount);
            orders[trade.orderNumber].resultingTrades.push(trade);
        });
        return orders
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type === 'market') {
            type = 'limit';
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
        let order = await this.parseOrder (this.extend ({
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
        price = Number (price);
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
                'price': Number(this.priceToPrecision(symbol, price)),
                'status': 'open',
            });
            if (amount !== undefined) {
                this.orders[newid]['amount'] = Number(amount);
            }
            result = this.extend (this.orders[newid]);
        } else {
            let market = undefined;
            if (symbol !== undefined) {
                market = this.market (symbol);
            }
            result = await this.parseOrder (response, market);
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
        const order = await this.parseOrder (result);
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
        try {
            const trades = await this.privatePostReturnOrderTrades (this.extend (request, params));
            return this.parseTrades (trades);
        }catch (e) {
            return undefined;
        }
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
        if ('error' in response) {
            const message = response['error'];
            const exact = this.exceptions['exact'];
            if (message in exact) {
                throw new exact[message](message);
            }
            const broad = this.exceptions['broad'];
            const broadKey = this.findBroadlyMatchedKey (broad, message);
            if (broadKey !== undefined) {
                throw new broad[broadKey](message);
            }
            throw new ExchangeError(message); // unknown message
        }
    }
};
