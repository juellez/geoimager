////////////////////////////////////////////////////////////////////////////////////////
// Attachments - these are geotagged files - likely images, though could be sound files

Attachments = new Meteor.Collection("attachments");

Attachments.allow({
  insert: function (userId, post) {
    return false;
  },
  update: function (userId, post, fields, modifier) {
    if (userId !== attachment.owner)
      return false; // not the owner

    // var allowed = ["title", "description", "x", "y"];
    // if (_.difference(fields, allowed).length)
    //   return false; // tried to write to forbidden field

    return true;
  },
  remove: function (userId, post) {
    // You can only remove posts that you created and nobody is going to.
    return attachment.owner === userId;
  }
});
