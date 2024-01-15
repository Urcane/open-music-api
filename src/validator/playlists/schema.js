const Joi = require('joi');

const PostPlaylistPayloadSchema = Joi.object({
  name: Joi.string().required(),
});

const PostSongPlaylistPayloadSchema = Joi.object({
  songId: Joi.string().required(),
});

const DeleteSongPlaylistPlayloadSchema = Joi.object({
  songId: Joi.string().required(),
});

module.exports = {
  PostPlaylistPayloadSchema,
  PostSongPlaylistPayloadSchema,
  DeleteSongPlaylistPlayloadSchema,
};
