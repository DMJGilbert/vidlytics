Streams = new Mongo.Collection('streams');

Streams.helpers({});

var AnalyticsSchema = new SimpleSchema({
	cdn: {
		type: String,
		max: 100
	},
	ipAddress: {
		type: String,
		max: 100
	},
	bitRate: {
		type: Number
	},
	resolution: {
		type: String,
		max: 100
	},
	droppedFrames: {
		type: Number
	},
	preBuffering: {
		type: Number
	},
	buffering: {
		type: Number
	},
	long: {
		type: String,
		max: 100
	},
	lat: {
		type: String,
		max: 100
	}
});


Streams.attachSchema({
	customerId: {
		type: String
	},
	name: {
		type: String,
		max: 200
	},
	address: {
		type: String,
		max: 200
	},
	analytics: {
		type: [AnalyticsSchema],
		optional: true
	}
});

Streams.before.insert(function (userId, doc) {
	doc.createdAt = new Date();
	doc.customerId = userId;
	doc.analytics = [];
});
