const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../error/InvariantError');

class CollaborationsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async verifyCollaborator(playlistId, userId) {
    const query = {
      text: 'SELECT * FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
      values: [playlistId, userId],
    };

    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new InvariantError('Gagal verifikasi Kolaborasi');
    }
  }

  async verifyNewCollaboration(playlistId, userId) {
    const query = {
      text: 'SELECT * FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
      values: [playlistId, userId],
    };

    const { rowCount } = await this._pool.query(query);

    if (rowCount) {
      throw new InvariantError('Collaborator sudah ada!');
    }
  }

  async addCollaboration(playlistId, userId) {
    await this.verifyNewCollaboration(playlistId, userId);

    const id = `collab-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO collaborations VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, userId],
    };

    const { rows, rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new InvariantError('Collab gagal ditambahkan');
    }

    await this._cacheService.delete(`playlist:${userId}`);
    return rows[0].id;
  }

  async deleteCollaboration(playlistId, userId) {
    const query = {
      text: 'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id',
      values: [playlistId, userId],
    };

    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new InvariantError('Collab gagal dihapus');
    }

    await this._cacheService.delete(`playlist:${userId}`);
  }
}

module.exports = CollaborationsService;
