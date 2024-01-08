const autoBind = require('auto-bind');

class SongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postSongByIdHandler(request, h) {
    this._validator.validateSongPayload(request.payload);

    const songId = await this._service.addSong(request.payload);

    const result = h.response({
      status: 'success',
      message: 'Lagu telah ditambahkan',
      data: {
        songId,
      },
    });

    result.code(201);
    return result;
  }

  async getSongByIdHandler(request) {
    const { id } = request.params;
    const song = await this._service.getSongById(id);

    return {
      status: 'success',
      data: {
        song,
      },
    };
  }

  async putSongByIdHandler(request) {
    this._validator.validateSongPayload(request.payload);
    const { id } = request.params;

    const songId = await this._service.editSongById(id, request.payload);

    return {
      status: 'success',
      message: `Lagu dengan id ${songId} telah berhasil diperbarui`,
    };
  }

  async deleteSongByIdHandler(request) {
    const { id } = request.params;

    const songId = await this._service.deleteSongById(id);

    return {
      status: 'success',
      message: `Lagu dengan id ${songId} telah berhasil dihapus`,
    };
  }

  async getAllSongByIdHandler(request) {
    const songs = await this._service.getAllSongs(request.query);

    return {
      status: 'success',
      data: {
        songs,
      },
    };
  }
}

module.exports = SongsHandler;
