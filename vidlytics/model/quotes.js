Quotes = new Mongo.Collection("quotes");

Quotes.allow({
	insert: function (userId, quote) {
		return userId && quote.owner === userId;
	},
	update: function (userId, quote, fields, modifier) {
		return userId && quote.owner === userId;
	},
	remove: function (userId, quote) {
		return userId && quote.owner === userId;
	}
});