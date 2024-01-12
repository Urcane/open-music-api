const singleSongModel = ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  albumId,
}) => ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  album_id: albumId,
});

const songsModel = ({
  id,
  title,
  performer,
}) => ({
  id,
  title,
  performer,
});

const albumsModel = ({
  id,
  name,
  year,
}, songs) => ({
  id,
  name,
  year,
  songs,
});

const playlistSong = (data) => ({
  id: data[0].id,
  name: data[0].name,
  username: data[0].username,
  songs: data.map(({ songId, title, performer }) => ({
    id: songId,
    title,
    performer,
  })),
});

const activities = (playlistId, data) => ({
  playlistId,
  activities: data,
});

module.exports = {
  singleSongModel,
  songsModel,
  albumsModel,
  playlistSong,
  activities,
};
