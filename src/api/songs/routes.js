const routes = (handler) => [
  {
    method: 'POST',
    path: '/songs',
    handler: handler.postSongByIdHandler,
  },
  {
    method: 'GET',
    path: '/songs',
    handler: handler.getAllSongByIdHandler,
  },
  {
    method: 'GET',
    path: '/songs/{id}',
    handler: handler.getSongByIdHandler,
  },
  {
    method: 'PUT',
    path: '/songs/{id}',
    handler: handler.putSongByIdHandler,
  },
  {
    method: 'DELETE',
    path: '/songs/{id}',
    handler: handler.deleteSongByIdHandler,
  },
];

module.exports = routes;
