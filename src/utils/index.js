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

module.exports = { singleSongModel, songsModel, albumsModel };