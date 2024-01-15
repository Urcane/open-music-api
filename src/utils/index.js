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

const albumSong = (data) => ({
  id: data[0].album_id,
  name: data[0].name,
  year: data[0].year,
  coverUrl: data[0].cover,
  songs: data[0].id ? data.map(songsModel) : [],
});

const playlistSong = (data) => ({
  id: data[0].id,
  name: data[0].name,
  username: data[0].username,
  songs: data.map(({ song_id: songId, title, performer }) => ({
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
  albumSong,
  playlistSong,
  activities,
};
