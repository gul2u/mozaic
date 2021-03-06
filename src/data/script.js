function stickyScroll() {
  var groups = document.querySelectorAll('.group h1');
  var offset = 70;
  var padding = 10;
  document.getElementById('groups').addEventListener('scroll', reposition);
  reposition();

  function reposition() {
    for (var i = 0; i < groups.length; i++) {
      var el = groups[i];
      var elRect = el.getBoundingClientRect();
      var containerRect = el.parentNode.getBoundingClientRect();

      if (elRect.top <= offset && elRect.bottom >= (containerRect.bottom - padding)) {
        el.className = 'bottom';
      }
      else if ((elRect.top <= offset && elRect.top > containerRect.top) || el.className == 'bottom') {
        el.className = 'sticky';
      }
      else {
        el.className = '';
      }
    }
  }
}

function keyboardControl() {
  var index = -1;
  var headerHeight = 60;
  $(document).keydown(function(e) {
    var keys = { up: 38, down: 40, enter: 13 };
    switch (e.which) {
      case keys.up:    up();    break;
      case keys.down:  down();  break;
      case keys.enter: enter(); break;
    }
  });

  function up() {
    if (!$('ul.items li')[index - 1]) return;

    var active = $('ul.items li.active');
    var next = $($('ul.items li')[--index]);

    active.removeClass('active');
    next.addClass('active');

    var nextRect = next[0].getBoundingClientRect();
    var nextTop = next.offset().top;

    if (nextRect.top < 0) {
      next[0].scrollIntoView(true);
    }

    return false;
  };

  function down() {
    if (!$('ul.items li')[index + 1]) return;

    var active = $('ul.items li.active');
    var next = $($('ul.items li')[++index]);

    active.removeClass('active');
    next.addClass('active');

    var nextRect = next[0].getBoundingClientRect();
    var nextTop = next.offset().top;

    if (nextRect.bottom > $(window).height()) {
      next[0].scrollIntoView(false);
    }

    return false;
  };

  function enter() {
    var active = $('ul.items li.active');
    var link = active.find('a').attr('href');
    window.open(link);
  };
}

function infoToggle() {
  var visible = false;
  $('#info-toggle').click(function() {
    if (visible) $('body').removeClass('info-visible');
    else $('body').addClass('info-visible');
    visible = !visible;
  });
}

function viewToggle() {
  var views = ['grid', 'list'];
  $('#list').click(function() {
    $('body').removeClass('grid').addClass('list');
  });
  $('#grid').click(function() {
    $('body').removeClass('list').addClass('grid');
  });
}

function hoverInfo() {
  $('#groups li').hover(function() {
    var infoEl = $('#info');
    if (infoEl.hasClass('editing')) return;

    var item = $(this).data('item');
    var folder = $(this).parent().parent().find('.name h1').text();
    infoEl.find('.thumb').attr('src', item.thumb);
    infoEl.find('.title').text(item.title);
    infoEl.find('.url a').attr('href', item.location).text(item.location);
    infoEl.find('.folder').text(folder);
    infoEl.find('.added').text(item.added);
    infoEl.find('.visited').text(item.visited);
    infoEl.find('.visits').text(item.visits);
    infoEl.find('.tags').empty();
    if (item.tags) {
      item.tags.forEach(function(tag) {
        var html = '<li>' + tag + '</li>';
        var el = $(html);
        el.appendTo(infoEl.find('.tags'));
      });
    }
  });
}

function editInfo() {
  $('.edit').click(function(e) {
    $('body').addClass('info-visible');
    var infoEl = $('#info');
    var itemEl = $(this).parent().parent();
    var item = itemEl.data('item');
    infoEl.addClass('editing');
    infoEl.find('.thumb').attr('src', item.thumb);
    infoEl.find('.title').text(item.title);
    infoEl.find('.url a').attr('href', item.location).text(item.location);
    infoEl.find('.folder').text(item.folder);
    infoEl.find('#edit-title').val(item.title);
    infoEl.find('#edit-url').val(item.location);
    e.preventDefault();
    e.stopPropagation();
    return false;
  });
  $('.done').click(function() {
    $('#info').removeClass('editing');
  })
}

function clearContent() {
  $('#groups').empty();
}

function contentToggle() {
  var content = [
    { id: 'bookmarks', name: 'Bookmarks'},
    { id: 'tabs', name: 'Tabs'},
    { id: 'history', name: 'History'}
  ];
  content.forEach(function(module) {
    var el = document.getElementById(module.id);
    el.addEventListener('click', function() {
      clearContent();
      $('ul.nav li').removeClass('active');
      $(el).addClass('active');
      document.title = module.name;
      self.port.emit(module.id);
    })
  });
}

function bindItems() {
  stickyScroll();
  keyboardControl();
  hoverInfo();
  editInfo();
}

$(function() {
  infoToggle();
  viewToggle();
  contentToggle();
});
