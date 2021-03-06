const places = require('places');
const moment = require('moment.min');
const {Cu} = require('chrome');
Cu.import('resource://gre/modules/Services.jsm', this);
Cu.import('resource:///modules/PageThumbs.jsm', this);

exports.Bookmarks = {
  name: 'Bookmarks',
  id: 'bookmarks',
  get: get
}

let counter = 0;

function queryFolder(folder, worker) {
  counter++;
  worker.port.emit('group', folder);
  let bookmarks = [];
  places.bookmarks.search({
    bookmarked: {
      folder: folder.id
    },
    onResult: function(result) {
      if (result.type == 'folder' && !result.location) {
        let folder = {
          id: result._itemId,
          title: result.title
        };
        queryFolder(folder, worker);
      }
      else if (result.type == 'bookmark' && result.location.indexOf('javascript') != 0) {
        let file = PageThumbsStorage.getFileForURL(result.location);
        let uri = Services.io.newFileURI(file);
        let bookmark = {
          group: result.folder,
          location: result.location,
          title: result.title || result.location,
          tags: result.tags,
          icon: result.icon,
          thumb: uri.spec,
          added: moment(result.dateAdded).calendar(),
          visited: moment(result.time).calendar(),
          visits: result.accessCount
        };
        bookmarks[result.position] = bookmark;
      }
    },
    onComplete: function() {
      bookmarks.forEach(function(bookmark) {
        worker.port.emit('item', bookmark);
      });
      // Check if done with all bookmarks
      counter--;
      if (counter == 0) {
        worker.port.emit('complete');
      }
    }
  });
}

function get(worker) {
  queryFolder({ id: places.bookmarks.menu,    title: 'Bookmarks Menu'    }, worker);
  queryFolder({ id: places.bookmarks.toolbar, title: 'Bookmarks Toolbar' }, worker);
  queryFolder({ id: places.bookmarks.unfiled, title: 'Unsorted Bookmarks' }, worker);
}
