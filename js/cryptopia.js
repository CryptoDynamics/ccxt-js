'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, InsufficientFunds, InvalidOrder, OrderNotFound, OrderNotCached, InvalidNonce } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class cryptopia extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'cryptopia',
            'name': 'Cryptopia',
            'rateLimit': 1500,
            'countries': [ 'NZ' ], // New Zealand
            'has': {
                'CORS': false,
                'createMarketOrder': false,
                'fetchClosedOrders': 'emulated',
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchMyTrades': true,
                'fetchTransactions': false,
                'fetchWithdrawals': true,
                'fetchDeposits': true,
                'fetchOHLCV': true,
                'fetchOrder': 'emulated',
                'fetchOrderBooks': true,
                'fetchOrders': 'emulated',
                'fetchOpenOrders': true,
                'fetchTickers': true,
                'deposit': true,
                'withdraw': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/29484394-7b4ea6e2-84c6-11e7-83e5-1fccf4b2dc81.jpg',
                'api': {
                    'public': 'https://www.cryptopia.co.nz/api',
                    'private': 'https://www.cryptopia.co.nz/api',
                    'web': 'https://www.cryptopia.co.nz',
                },
                'www': 'https://www.cryptopia.co.nz',
                'referral': 'https://www.cryptopia.co.nz/Register?referrer=kroitor',
                'doc': [
                    'https://support.cryptopia.co.nz/csm?id=kb_article&sys_id=a75703dcdbb9130084ed147a3a9619bc',
                    'https://support.cryptopia.co.nz/csm?id=kb_article&sys_id=40e9c310dbf9130084ed147a3a9619eb',
                ],
            },
            'timeframes': {
                '15m': 15,
                '30m': 30,
                '1h': 60,
                '2h': 120,
                '4h': 240,
                '12h': 720,
                '1d': 1440,
                '1w': 10080,
            },
            'api': {
                'web': {
                    'get': [
                        'Exchange/GetTradePairChart',
                    ],
                },
                'public': {
                    'get': [
                        'GetCurrencies',
                        'GetTradePairs',
                        'GetMarkets',
                        'GetMarkets/{id}',
                        'GetMarkets/{hours}',
                        'GetMarkets/{id}/{hours}',
                        'GetMarket/{id}',
                        'GetMarket/{id}/{hours}',
                        'GetMarketHistory/{id}',
                        'GetMarketHistory/{id}/{hours}',
                        'GetMarketOrders/{id}',
                        'GetMarketOrders/{id}/{count}',
                        'GetMarketOrderGroups/{ids}',
                        'GetMarketOrderGroups/{ids}/{count}',
                    ],
                },
                'private': {
                    'post': [
                        'CancelTrade',
                        'GetBalance',
                        'GetDepositAddress',
                        'GetOpenOrders',
                        'GetTradeHistory',
                        'GetTransactions',
                        'SubmitTip',
                        'SubmitTrade',
                        'SubmitTransfer',
                        'SubmitWithdraw',
                    ],
                },
            },
            'commonCurrencies': {
                'ACC': 'AdCoin',
                'BAT': 'BatCoin',
                'BEAN': 'BITB', // rebranding, see issue #3380
                'BLZ': 'BlazeCoin',
                'BTG': 'Bitgem',
                'CAN': 'CanYaCoin',
                'CAT': 'Catcoin',
                'CC': 'CCX',
                'CMT': 'Comet',
                'EPC': 'ExperienceCoin',
                'FCN': 'Facilecoin',
                'FT': 'Fabric Token',
                'FUEL': 'FC2', // FuelCoin != FUEL
                'HAV': 'Havecoin',
                'HC': 'Harvest Masternode Coin', // != HyperCash
                'HSR': 'HC',
                'KARM': 'KARMA',
                'LBTC': 'LiteBitcoin',
                'LDC': 'LADACoin',
                'MARKS': 'Bitmark',
                'NET': 'NetCoin',
                'PLC': 'Polcoin',
                'RED': 'RedCoin',
                'STC': 'StopTrumpCoin',
                'QBT': 'Cubits',
                'WRC': 'WarCoin',
            },
            'options': {
                'fetchTickersErrors': true,
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetGetTradePairs ();
        const result = [];
        const markets = response['Data'];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const numericId = market['Id'];
            const label = market['Label'];
            const baseId = market['Symbol'];
            const quoteId = market['BaseSymbol'];
            const base = this.commonCurrencyCode (baseId);
            const quote = this.commonCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const id = baseId + '_' + quoteId;
            const precision = {
                'amount': 8,
                'price': 8,
            };
            const lot = market['MinimumTrade'];
            const priceLimits = {
                'min': market['MinimumPrice'],
                'max': market['MaximumPrice'],
            };
            const amountLimits = {
                'min': lot,
                'max': market['MaximumTrade'],
            };
            const limits = {
                'amount': amountLimits,
                'price': priceLimits,
                'cost': {
                    'min': market['MinimumBaseTrade'],
                    'max': undefined,
                },
            };
            const active = market['Status'] === 'OK';
            result.push ({
                'id': id,
                'symbol': symbol,
                'numericId': numericId,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'info': market,
                'maker': market['TradeFee'] / 100,
                'taker': market['TradeFee'] / 100,
                'active': active,
                'precision': precision,
                'limits': limits,
                'label': label,
            });
        }
        this.options['marketsByLabel'] = this.indexBy (result, 'label');
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetGetMarketOrdersId (this.extend ({
            'id': this.marketId (symbol),
        }, params));
        const orderbook = response['Data'];
        return this.parseOrderBook (orderbook, undefined, 'Buy', 'Sell', 'Price', 'Volume');
    }

    async fetchOHLCV (symbol, timeframe = '15m', since = undefined, limit = undefined, params = {}) {
        let dataRange = 0;
        if (since !== undefined) {
            const dataRanges = [
                86400,
                172800,
                604800,
                1209600,
                2592000,
                7776000,
                15552000,
            ];
            const numDataRanges = dataRanges.length;
            const now = this.seconds ();
            const sinceSeconds = parseInt (since / 1000);
            for (let i = 1; i < numDataRanges; i++) {
                if ((now - sinceSeconds) > dataRanges[i]) {
                    dataRange = i;
                }
            }
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'tradePairId': market['numericId'],
            'dataRange': dataRange,
            'dataGroup': this.timeframes[timeframe],
        };
        const response = await this.webGetExchangeGetTradePairChart (this.extend (request, params));
        const candles = response['Candle'];
        const volumes = response['Volume'];
        for (let i = 0; i < candles.length; i++) {
            candles[i].push (volumes[i]['basev']);
        }
        return this.parseOHLCVs (candles, market, timeframe, since, limit);
    }

    joinMarketIds (ids, glue = '-') {
        let result = ids[0].toString ();
        for (let i = 1; i < ids.length; i++) {
            result += glue + ids[i].toString ();
        }
        return result;
    }

    async fetchOrderBooks (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        if (symbols === undefined) {
            throw new ExchangeError (this.id + ' fetchOrderBooks requires the symbols argument as of May 2018 (up to 5 symbols at max)');
        }
        const numSymbols = symbols.length;
        if (numSymbols > 5) {
            throw new ExchangeError (this.id + ' fetchOrderBooks accepts 5 symbols at max');
        }
        const ids = this.joinMarketIds (this.marketIds (symbols));
        const response = await this.publicGetGetMarketOrderGroupsIds (this.extend ({
            'ids': ids,
        }, params));
        const orderbooks = response['Data'];
        const result = {};
        for (let i = 0; i < orderbooks.length; i++) {
            const orderbook = orderbooks[i];
            const id = this.safeString (orderbook, 'Market');
            let symbol = id;
            if (id in this.markets_by_id) {
                const market = this.markets_by_id[id];
                symbol = market['symbol'];
            }
            result[symbol] = this.parseOrderBook (orderbook, undefined, 'Buy', 'Sell', 'Price', 'Volume');
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        const timestamp = this.milliseconds ();
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const open = this.safeFloat (ticker, 'Open');
        const last = this.safeFloat (ticker, 'LastPrice');
        const change = last - open;
        const baseVolume = this.safeFloat (ticker, 'Volume');
        const quoteVolume = this.safeFloat (ticker, 'BaseVolume');
        let vwap = undefined;
        if (quoteVolume !== undefined) {
            if (baseVolume !== undefined) {
                if (baseVolume > 0) {
                    vwap = quoteVolume / baseVolume;
                }
            }
        }
        return {
            'symbol': symbol,
            'info': ticker,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'High'),
            'low': this.safeFloat (ticker, 'Low'),
            'bid': this.safeFloat (ticker, 'BidPrice'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'AskPrice'),
            'askVolume': undefined,
            'vwap': vwap,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': this.safeFloat (ticker, 'Change'),
            'average': this.sum (last, open) / 2,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const response = await this.publicGetGetMarketId (this.extend ({
            'id': market['id'],
        }, params));
        const ticker = response['Data'];
        return this.parseTicker (ticker, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetGetMarkets (params);
        const result = {};
        const tickers = response['Data'];
        for (let i = 0; i < tickers.length; i++) {
            const ticker = tickers[i];
            const id = ticker['Label'].replace ('/', '_');
            const recognized = (id in this.markets_by_id);
            if (!recognized) {
                if (this.options['fetchTickersErrors']) {
                    throw new ExchangeError (this.id + ' fetchTickers() returned unrecognized pair id ' + id.toString ());
                }
            } else {
                const market = this.markets_by_id[id];
                const symbol = market['symbol'];
                result[symbol] = this.parseTicker (ticker, market);
            }
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    parseTrade (trade, market = undefined) {
        let timestamp = undefined;
        if ('Timestamp' in trade) {
            timestamp = trade['Timestamp'] * 1000;
        } else if ('TimeStamp' in trade) {
            timestamp = this.parse8601 (trade['TimeStamp']);
        }
        let price = this.safeFloat (trade, 'Price');
        if (!price) {
            price = this.safeFloat (trade, 'Rate');
        }
        const cost = this.safeFloat (trade, 'Total');
        const id = this.safeString (trade, 'TradeId');
        if (market === undefined) {
            let marketId = this.safeString (trade, 'Market');
            marketId = marketId.replace ('/', '_');
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            }
        }
        let symbol = undefined;
        let fee = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
            if ('Fee' in trade) {
                fee = {
                    'currency': market['quote'],
                    'cost': trade['Fee'],
                };
            }
        }
        return {
            'id': id,
            'info': trade,
            'order': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': 'limit',
            'side': trade['Type'].toLowerCase (),
            'price': price,
            'cost': cost,
            'amount': trade['Amount'],
            'fee': fee,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        let hours = 24; // the default
        if (since !== undefined) {
            const elapsed = this.milliseconds () - since;
            const hour = 1000 * 60 * 60;
            hours = parseInt (Math.ceil (elapsed / hour));
        }
        const request = {
            'id': market['id'],
            'hours': hours,
        };
        const response = await this.publicGetGetMarketHistoryIdHours (this.extend (request, params));
        const trades = response['Data'];
        return this.parseTrades (trades, market, since, limit);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // fetchWithdrawals
        //
        //     {
        //         Id: 937355,
        //         Currency: 'BTC',
        //         TxId: '5ba7784576cee48bfb9d1524abf7bdade3de65e0f2f9cdd25f7bef2c506cf296',
        //         Type: 'Withdraw',
        //         Amount: 0.7,
        //         Fee: 0,
        //         Status: 'Complete',
        //         Confirmations: 0,
        //         Timestamp: '2017-10-10T18:39:03.8928376',
        //         Address: '14KyZTusAZZGEmZzxsWf4pee7ThtA2iv2E',
        //     }
        //
        // fetchDeposits
        //     {
        //         Id: 7833741,
        //         Currency: 'BCH',
        //         TxId: '0000000000000000011865af4122fe3b144e2cbeea86142e8ff2fb4107352d43',
        //         Type: 'Deposit',
        //         Amount: 0.0003385,
        //         Fee: 0,
        //         Status: 'Confirmed',
        //         Confirmations: 6,
        //         Timestamp: '2017-08-01T16:19:24',
        //         Address: null
        //     }
        //
        const timestamp = this.parse8601 (this.safeString (transaction, 'Timestamp'));
        let code = undefined;
        const currencyId = this.safeString (transaction, 'Currency');
        currency = this.safeValue (this.currencies_by_id, currencyId);
        if (currency === undefined) {
            code = this.commonCurrencyCode (currencyId);
        }
        if (currency !== undefined) {
            code = currency['code'];
        }
        let status = this.safeString (transaction, 'Status');
        const txid = this.safeString (transaction, 'TxId');
        if (status !== undefined) {
            status = this.parseTransactionStatus (status);
        }
        const id = this.safeString (transaction, 'Id');
        const type = this.parseTransactionType (this.safeString (transaction, 'Type'));
        const amount = this.safeFloat (transaction, 'Amount');
        const address = this.safeString (transaction, 'Address');
        const feeCost = this.safeFloat (transaction, 'Fee');
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

    parseTransactionStatus (status) {
        const statuses = {
            'Confirmed': 'ok',
            'Complete': 'ok',
            'Pending': 'pending',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransactionType (type) {
        const types = {
            'Withdraw': 'withdrawal',
            'Deposit': 'deposit',
        };
        return this.safeString (types, type, type);
    }

    async fetchTransactionsByType (type, code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'type': (type === 'deposit') ? 'Deposit' : 'Withdraw',
        };
        const response = await this.privatePostGetTransactions (this.extend (request, params));
        return this.parseTransactions (response['Data'], code, since, limit);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchTransactionsByType ('withdrawal', code, since, limit, params);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchTransactionsByType ('deposit', code, since, limit, params);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['Market'] = market['id'];
        }
        if (limit !== undefined) {
            request['Count'] = limit; // default 100
        }
        const response = await this.privatePostGetTradeHistory (this.extend (request, params));
        return this.parseTrades (response['Data'], market, since, limit);
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetGetCurrencies (params);
        const currencies = response['Data'];
        const result = {};
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const id = currency['Symbol'];
            // todo: will need to rethink the fees
            // to add support for multiple withdrawal/deposit methods and
            // differentiated fees for each particular method
            const precision = 8; // default precision, todo: fix "magic constants"
            const code = this.commonCurrencyCode (id);
            let active = (currency['ListingStatus'] === 'Active');
            const status = currency['Status'].toLowerCase ();
            if (status !== 'ok') {
                active = false;
            }
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'name': currency['Name'],
                'active': active,
                'status': status,
                'fee': currency['WithdrawFee'],
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
                        'min': currency['MinBaseTrade'],
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': currency['MinWithdraw'],
                        'max': currency['MaxWithdraw'],
                    },
                },
            };
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostGetBalance (params);
        const balances = response['Data'];
        const result = { 'info': response };
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const code = balance['Symbol'];
            const currency = this.commonCurrencyCode (code);
            const account = {
                'free': balance['Available'],
                'used': 0.0,
                'total': balance['Total'],
            };
            account['used'] = account['total'] - account['free'];
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type === 'market') {
            throw new ExchangeError (this.id + ' allows limit orders only');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        // price = parseFloat (price);
        // amount = parseFloat (amount);
        const request = {
            'Market': market['id'],
            'Type': this.capitalize (side),
            // 'Rate': this.priceToPrecision (symbol, price),
            // 'Amount': this.amountToPrecision (symbol, amount),
            'Rate': price,
            'Amount': amount,
        };
        const response = await this.privatePostSubmitTrade (this.extend (request, params));
        if (!response) {
            throw new ExchangeError (this.id + ' createOrder returned unknown error: ' + this.json (response));
        }
        let id = undefined;
        let filled = 0.0;
        let status = 'open';
        if ('Data' in response) {
            if ('OrderId' in response['Data']) {
                if (response['Data']['OrderId']) {
                    id = response['Data']['OrderId'].toString ();
                } else {
                    filled = amount;
                    status = 'closed';
                }
            }
        }
        const order = {
            'id': id,
            'timestamp': undefined,
            'datetime': undefined,
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'cost': price * amount,
            'amount': amount,
            'remaining': amount - filled,
            'filled': filled,
            'fee': undefined,
            // 'trades': this.parseTrades (order['trades'], market),
        };
        if (id) {
            this.orders[id] = order;
        }
        return this.extend ({ 'info': response }, order);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = undefined;
        try {
            response = await this.privatePostCancelTrade (this.extend ({
                'Type': 'Trade',
                'OrderId': id,
            }, params));
            // We do not know if it is indeed canceled, but cryptopia lacks any
            // reasonable method to get information on executed or canceled order.
            if (id in this.orders) {
                this.orders[id]['status'] = 'canceled';
            }
        } catch (e) {
            if (this.last_json_response) {
                const message = this.safeString (this.last_json_response, 'Error');
                if (message) {
                    if (message.indexOf ('does not exist') >= 0) {
                        throw new OrderNotFound (this.id + ' cancelOrder() error: ' + this.last_http_response);
                    }
                }
            }
            throw e;
        }
        return this.parseOrder (response);
    }

    parseOrder (order, market = undefined) {
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        } else if ('Market' in order) {
            const id = order['Market'];
            if (id in this.markets_by_id) {
                market = this.markets_by_id[id];
                symbol = market['symbol'];
            } else {
                if (id in this.options['marketsByLabel']) {
                    market = this.options['marketsByLabel'][id];
                    symbol = market['symbol'];
                }
            }
        }
        const timestamp = this.parse8601 (this.safeString (order, 'TimeStamp'));
        const amount = this.safeFloat (order, 'Amount');
        const remaining = this.safeFloat (order, 'Remaining');
        let filled = undefined;
        if (amount !== undefined && remaining !== undefined) {
            filled = amount - remaining;
        }
        let id = this.safeValue (order, 'OrderId');
        if (id !== undefined) {
            id = id.toString ();
        }
        let side = this.safeString (order, 'Type');
        if (side !== undefined) {
            side = side.toLowerCase ();
        }
        return {
            'id': id,
            'info': this.omit (order, 'status'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': this.safeString (order, 'status'),
            'symbol': symbol,
            'type': 'limit',
            'side': side,
            'price': this.safeFloat (order, 'Rate'),
            'cost': this.safeFloat (order, 'Total'),
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'fee': undefined,
            // 'trades': this.parseTrades (order['trades'], market),
        };
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        const request = {
            // 'Market': market['id'],
            // 'TradePairId': market['id'], // Cryptopia identifier (not required if 'Market' supplied)
            // 'Count': 100, // default = 100
        };
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['Market'] = market['id'];
        }
        const response = await this.privatePostGetOpenOrders (this.extend (request, params));
        const orders = [];
        for (let i = 0; i < response['Data'].length; i++) {
            orders.push (this.extend (response['Data'][i], { 'status': 'open' }));
        }
        const openOrders = this.parseOrders (orders, market);
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
                const order = this.orders[id];
                if (order['status'] === 'open') {
                    if ((symbol === undefined) || (order['symbol'] === symbol)) {
                        this.orders[id] = this.extend (order, {
                            'status': 'closed',
                            'cost': order['amount'] * order['price'],
                            'filled': order['amount'],
                            'remaining': 0.0,
                        });
                    }
                }
            }
            const order = this.orders[id];
            if ((symbol === undefined) || (order['symbol'] === symbol)) {
                result.push (order);
            }
        }
        return this.filterBySinceLimit (result, since, limit);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        id = id.toString ();
        const orders = await this.fetchOrders (symbol, undefined, undefined, params);
        for (let i = 0; i < orders.length; i++) {
            if (orders[i]['id'] === id) {
                return orders[i];
            }
        }
        throw new OrderNotCached (this.id + ' order ' + id + ' not found in cached .orders, fetchOrder requires .orders (de)serialization implemented for this method to work properly');
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const orders = await this.fetchOrders (symbol, since, limit, params);
        const result = [];
        for (let i = 0; i < orders.length; i++) {
            if (orders[i]['status'] === 'open') {
                result.push (orders[i]);
            }
        }
        return result;
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const orders = await this.fetchOrders (symbol, since, limit, params);
        const result = [];
        for (let i = 0; i < orders.length; i++) {
            if (orders[i]['status'] === 'closed') {
                result.push (orders[i]);
            }
        }
        return result;
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const response = await this.privatePostGetDepositAddress (this.extend ({
            'Currency': currency['id'],
        }, params));
        let address = this.safeString (response['Data'], 'BaseAddress');
        let tag = this.safeString (response['Data'], 'Address');
        if (address !== undefined) {
            if (address.length < 1) {
                address = undefined;
            }
        }
        if (address === undefined) {
            address = tag;
            tag = undefined;
        }
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'info': response,
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        this.checkAddress (address);
        const request = {
            'Currency': currency['id'],
            'Amount': amount,
            'Address': address, // Address must exist in you AddressBook in security settings
        };
        if (tag) {
            request['PaymentId'] = tag;
        }
        const response = await this.privatePostSubmitWithdraw (this.extend (request, params));
        return {
            'info': response,
            'id': response['Data'],
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ().toString ();
            body = this.json (query, { 'convertArraysToObjects': true });
            let hash = this.hash (this.encode (body), 'md5', 'base64');
            const secret = this.base64ToBinary (this.secret);
            const uri = this.encodeURIComponent (url);
            const lowercase = uri.toLowerCase ();
            hash = this.binaryToString (hash);
            const payload = this.apiKey + method + lowercase + nonce + hash;
            const signature = this.hmac (this.encode (payload), secret, 'sha256', 'base64');
            const auth = 'amx ' + this.apiKey + ':' + this.binaryToString (signature) + ':' + nonce;
            headers = {
                'Content-Type': 'application/json',
                'Authorization': auth,
            };
        } else {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    nonce () {
        return this.milliseconds ();
    }

    handleErrors (code, reason, url, method, headers, body, response) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        if ('Success' in response) {
            const success = this.safeValue (response, 'Success');
            if (success !== undefined) {
                if (!success) {
                    const error = this.safeString (response, 'Error');
                    const feedback = this.id + ' ' + body;
                    if (typeof error === 'string') {
                        if (error.indexOf ('Invalid trade amount') >= 0) {
                            throw new InvalidOrder (feedback);
                        }
                        if (error.indexOf ('No matching trades found') >= 0) {
                            throw new OrderNotFound (feedback);
                        }
                        if (error.indexOf ('does not exist') >= 0) {
                            throw new OrderNotFound (feedback);
                        }
                        if (error.indexOf ('Insufficient Funds') >= 0) {
                            throw new InsufficientFunds (feedback);
                        }
                        if (error.indexOf ('Nonce has already been used') >= 0) {
                            throw new InvalidNonce (feedback);
                        }
                    }
                    throw new ExchangeError (feedback);
                }
            }
        }
    }
};
