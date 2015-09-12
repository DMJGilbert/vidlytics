Streams = new Mongo.Collection("streams");

Streams.allow({
  insert: function (userId, stream) {
    return userId && stream.owner === userId;
  },
  update: function (userId, stream, fields, modifier) {
    return userId && stream.owner === userId;
  },
  remove: function (userId, stream) {
    return userId && stream.owner === userId;
  }
});
