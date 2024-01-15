const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../error/InvariantError');
const { albumSong } = require('../utils');
const NotFoundError = require('../error/NotFoundError');
const config = require('../utils/config');

class AlbumsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };

    const { rows } = await this._pool.query(query);

    if (!rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return rows[0].id;
  }

  async getAlbumById(id) {
    const query = {
      text: `
        SELECT 
          albums.id AS album_id, 
          albums.name, 
          albums.year, 
          albums.cover,
          songs.id, 
          songs.title, 
          songs.performer 
        LEFT JOIN songs 
          ON songs.album_id = albums.id 
        WHERE albums.id = $1
      `,
      values: [id],
    };

    const { rows, rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Album tidak ditemukan!');
    }

    return albumSong(rows[0], await this.getSongsFromAlbumId(id));
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };

    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Albums tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Albums tidak ditemukan');
    }
  }

  async checkAlbumIfExist(id) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };

    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Album Tidak ditemukan');
    }
  }

  async addAlbumCover(id, filename) {
    const urlLink = `http://${config.app.host}:${config.app.port}/albums/covers/${filename}`;

    const query = {
      text: 'UPDATE albums SET cover = $1 WHERE id = $2',
      values: [urlLink, id],
    };

    await this._pool.query(query);
  }

  async checkUserLikeAlbum(albumId, userId) {
    const query = {
      text: 'SELECT * FROM user_album_likes WHERE album_id = $1 AND user_id = $2',
      values: [albumId, userId],
    };

    const { rowCount } = await this._pool.query(query);

    return rowCount === 0;
  }

  async addLikeToAlbum(albumId, userId) {
    const likeId = `albumLike-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
      values: [likeId, userId, albumId],
    };

    const { rows } = await this._pool.query(query);

    if (!rows[0].id) {
      throw new InvariantError('Gagal menambahkan suka');
    }

    await this._cacheService.delete(`albumLike:${albumId}`);
  }

  async deleteLikeFromAlbum(albumId, userId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE album_id = $1 AND user_id = $2 RETURNING id',
      values: [albumId, userId],
    };

    const { rows } = await this._pool.query(query);

    if (!rows[0].id) {
      throw new InvariantError('Gagal menghapus suka');
    }

    await this._cacheService.delete(`albumLike:${albumId}`);
  }

  async countAlbumLike(albumId) {
    try {
      const result = await this._cacheService.get(`albumLike:${albumId}`);
      return {
        dataSource: 'cache',
        likeCount: parseInt(result, 10),
      };
    } catch {
      const query = {
        text: 'SELECT COUNT(id) FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      };

      const { rows } = await this._pool.query(query);
      const like = parseInt(rows[0].count, 10);

      await this._cacheService.set(`albumLike:${albumId}`, like);
      return {
        dataSource: 'database',
        likeCount: like,
      };
    }
  }
}

module.exports = AlbumsService;
