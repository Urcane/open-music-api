const {
  PostPlaylistPayloadSchema,
  PostSongPlaylistPayloadSchema,
  DeleteSongPlaylistPlayloadSchema,
} = require('./schema');
const InvariantError = require('../../error/InvariantError');

const PlaylistValidator = {
  validatePostPlaylistPayload: (payload) => {
    const validationResult = PostPlaylistPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  validatePostSongPlaylistPayload: (payload) => {
    const validationResult = PostSongPlaylistPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  validateDeleteSongPlaylistPayload: (payload) => {
    const validationResult = DeleteSongPlaylistPlayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = PlaylistValidator;
