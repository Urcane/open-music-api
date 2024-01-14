const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../error/InvariantError');
const { singleSongModel, songsModel } = require('../utils');
const NotFoundError = require('../error/NotFoundError');

class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({
    title,
    year,
    genre,
    performer,
    duration = null,
    albumId = null,
  }) {
    const id = `song-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO songs VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, year, genre, performer, duration, albumId],
    };

    const { rows } = await this._pool.query(query);

    if (!rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }

    return rows[0].id;
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs where id = $1',
      values: [id],
    };

    const { rows, rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }

    return rows.map(singleSongModel)[0];
  }

  async getAllSongs({ title, performer, limit }) {
    const { rows, rowCount } = await this._filteredSongsQuery(title, performer, limit);

    if (!rowCount) {
      return [];
    }

    return rows.map(songsModel);
  }

  async editSongById(id, {
    title,
    year,
    genre,
    performer,
    duration = null,
    albumId = null,
  }) {
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, album_id = $6 WHERE id = $7 RETURNING id',
      values: [title, year, genre, performer, duration, albumId, id],
    };

    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Update lagu gagal, Lagu tidak ditemukan!');
    }
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Gagal menghapus lagu, Lagu tidak ditemukan');
    }
  }

  async _filteredSongsQuery({ title, performer, limit }) {
    let query;

    if (title && performer && limit) {
      query = {
        text: 'SELECT id, title, performer FROM songs WHERE title iLIKE $1 AND performer iLike $2 LIMIT $3',
        values: [`%${title}%`, `%${performer}%`, limit],
      };
    }

    if (performer && limit) {
      query = {
        text: 'SELECT id, title, performer FROM songs WHERE performer iLike $1 LIMIT $2',
        values: [`%${performer}%`, limit],
      };
    }

    if (title && limit) {
      query = {
        text: 'SELECT id, title, performer FROM songs WHERE title iLike $1 LIMIT $2',
        values: [`%${title}%`, limit],
      };
    }

    if (title && performer) {
      query = {
        text: 'SELECT id, title, performer FROM songs WHERE title iLIKE $1 AND performer iLike $2',
        values: [`%${title}%`, `%${performer}%`],
      };
    }

    if (title) {
      query = {
        text: 'SELECT id, title, performer FROM songs WHERE title iLIKE $1',
        values: [`%${title}%`],
      };
    }

    if (performer) {
      query = {
        text: 'SELECT id, title, performer FROM songs WHERE performer iLIKE $1',
        values: [`%${performer}%`],
      };
    }

    if (limit) {
      query = {
        text: 'SELECT id, title, performer FROM songs LIMIT $1',
        values: [limit],
      };
    }

    query = {
      text: 'SELECT id, title, performer FROM songs',
    };

    return this._pool.query(query);
  }
}

module.exports = SongsService;
