Meteor.startup(function () {
	Streams.allow({
		insert: function (userId, stream) {
			return userId;
		},
		update: function (userId, stream) {
			return stream.customerId == userId;
		},
		remove: function (userId, stream) {
			return stream.customerId == userId;
		}
	});
});

Meteor.publish('streams', function () {
	if (this.userId) {
		return Streams.find({
			'customerId': this.userId
		});
	} else {
		return {};
	}
});
