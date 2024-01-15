const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const NotFoundError = require('../error/NotFoundError');
const AuthorizationError = require('../error/AuthorizationError');
const InvariantError = require('../error/InvariantError');
const { activities, playlistSong } = require('../utils');

class PlaylistsService {
  constructor(collaborationService, cacheService) {
    this._pool = new Pool();
    this._collaborationService = collaborationService;
    this._cacheService = cacheService;
  }

  async verifyPlaylistOwner(playlistId, userId) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [playlistId],
    };

    const { rows, rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    if (rows[0].owner !== userId) {
      throw new AuthorizationError('Anda tidak diizinkan untuk mengakses resource ini');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      try {
        await this._collaborationService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }

  async addPlaylist(name, owner) {
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING ID',
      values: [id, name, owner],
    };

    const { rows, rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    await this._cacheService.delete(`playlist:${owner}`);
    return rows[0].id;
  }

  async getPlaylist(owner) {
    try {
      const result = await this._cacheService.get(`playlist:${owner}`);

      return {
        dataSource: 'cache',
        playlists: JSON.parse(result),
      };
    } catch {
      const query = {
        text: `
          SELECT 
            playlists.id, 
            playlists.name, 
            users.username
          FROM playlists
          LEFT JOIN collaborations 
            ON collaborations.playlist_id = playlists.id
          JOIN users 
            ON users.id = playlists.owner
          WHERE playlists.owner = $1 OR collaborations.user_id = $1
        `,
        values: [owner],
      };

      const { rows } = await this._pool.query(query);
      await this._cacheService.set(`playlist:${owner}`, JSON.stringify(rows));

      return {
        dataSource: 'database',
        playlists: rows,
      };
    }
  }

  async deletePlaylistById(playlistId, owner) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [playlistId],
    };

    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new InvariantError('Playlist gagal dihapus');
    }

    await this._cacheService.delete(`playlist:${owner}`);
  }

  async addSongToPlaylistById(playlistId, songId) {
    const id = `playlist_songs-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlist_songs values($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }
  }

  async getSongFromPlaylistById(playlistId) {
    const query = {
      text: `
        SELECT 
          playlists.id, 
          playlists.name, 
          users.username,
          songs.id AS song_id, 
          songs.title, 
          songs.performer 
        FROM playlists
        JOIN playlist_songs ON playlist_songs.playlist_id = playlists.id 
        JOIN users ON users.id = playlists.owner
        JOIN songs ON songs.id = playlist_songs.song_id
        WHERE playlists.id = $1
      `,
      values: [playlistId],
    };

    const { rows, rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Playlist Tidak ada');
    }

    return playlistSong(rows);
  }

  async deleteSongFromPlaylistById(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
  }

  async addActivities(userId, playlistId, songId, action) {
    const id = `activities-${nanoid(16)}`;
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, playlistId, songId, userId, action, date],
    };

    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new InvariantError('Gagal menambahkan history');
    }
  }

  async getActivities(playlistId) {
    const query = {
      text: `
      SELECT 
        users.username, 
        songs.title, 
        playlist_song_activities.action, 
        playlist_song_activities.time 
      FROM playlist_song_activities
      INNER JOIN songs on songs.id = playlist_song_activities.song_id
      INNER JOIN users on users.id = playlist_song_activities.user_id
      WHERE playlist_song_activities.playlist_id = $1
      ORDER BY playlist_song_activities.time`,
      values: [playlistId],
    };

    const { rows, rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Playlist Tidak ada');
    }

    return activities(playlistId, rows);
  }
}

module.exports = PlaylistsService;
