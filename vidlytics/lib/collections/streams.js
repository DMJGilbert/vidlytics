Streams = new Mongo.Collection('streams');

var base64urlEncode;

if (Meteor.isServer) {
	var btoa = Meteor.npmRequire('btoa');

	base64urlEncode = function (unencoded) {
		var encoded = btoa(unencoded);
		return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
	};
}

Streams.helpers({});

var EventSchema = new SimpleSchema({
	message: {
		type: String
	},
	res: {
		type: String
	},
	bitrate: {
		type: String
	},
	timestamp: {
		type: Date
	}
});

var ViewerSchema = new SimpleSchema({
	device: {
		type: String
	},
	ip: {
		type: String
	},
	long: {
		type: String
	},
	lat: {
		type: String
	},
	started: {
		type: Date
	},
	event: {
		type: [EventSchema],
		optional: true
	}
});

Streams.attachSchema({
	customerId: {
		type: String
	},
	base64: {
		type: String,
		optional: true
	},
	name: {
		type: String,
		max: 200
	},
	address: {
		type: String,
		max: 200
	},
	viewers: {
		type: [ViewerSchema],
		optional: true
	}
});

Streams.before.insert(function (userId, doc) {
	doc.createdAt = new Date();
	if (Meteor.isServer) {
		doc.base64 = base64urlEncode(doc.address);
	}
	doc.customerId = userId;
	doc.viewers = [];
});
