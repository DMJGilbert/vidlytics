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
	timestamp: {
		type: Date
	}
});

var MetaSchema = new SimpleSchema({
	bandwidth: {
		type: String,
		optional: true
	},
	timestamp: {
		type: Date
	},
	droppedFrames: {
		type: Number,
		optional: true
	},
	width: {
		type: String,
		optional: true
	},
	currentLevel: {
		type: String,
		optional: true
	}
});

var ViewerSchema = new SimpleSchema({
	ident: {
		type: String
	},
	device: {
		type: String
	},
	ip: {
		type: String
	},
	long: {
		type: String,
		optional: true
	},
	lat: {
		type: String,
		optional: true
	},
	started: {
		type: Date
	},
	country: {
		type: String,
		optional: true
	},
	region: {
		type: String,
		optional: true
	},
	city: {
		type: String,
		optional: true
	},
	isp: {
		type: String,
		optional: true
	},
	event: {
		type: [EventSchema],
		optional: true
	},
	meta: {
		type: [MetaSchema],
		optional: true
	},
	serverToCDN: {
		type: Number,
		optional: true
	},
	clientToServer: {
		type: Number,
		optional: true
	},
	clientToCDN: {
		type: Number,
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
