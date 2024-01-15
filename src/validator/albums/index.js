const { AlbumPayloadSchema, ImageHeadersSchema } = require('./schema');
const InvariantError = require('../../error/InvariantError');

const AlbumValidator = {
  validateAlbumPayload: (payload) => {
    const validationResult = AlbumPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateCoverAlbumPayload: (payload) => {
    const validationResult = ImageHeadersSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = AlbumValidator;
