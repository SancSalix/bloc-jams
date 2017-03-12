var albums = [albumPicasso, albumMarconi, albumNichol];

var createSongRow = function(songNumber, songName, songLength) {
  var template =
    '<tr class="album-view-song-item">' +
    '<td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>' +
    '<td class="song-item-title">' + songName + '</td>' +
    '<td class="song-item-duration">' + songLength + '</td>' + '</tr>';

  var $row = $(template);
  var onHover = function(event) {
    var songItemNumber = $(this).find('.song-item-number');
    var songNumber = parseInt(songItemNumber.attr('data-song-number'));
    if (songNumber !== currentlyPlayingSongNumber) {
      songItemNumber.html(playButtonTemplate);
    }
  };

  var offHover = function(event) {
    var songItemNumber = $(this).find('.song-item-number');
    var songNumber = parseInt(songItemNumber.attr('data-song-number'));
    if (songNumber !== currentlyPlayingSongNumber) {
      songItemNumber.html(songNumber);
    }
  };
  $row.find('.song-item-number').click(clickHandler);
  $row.hover(onHover, offHover);
  // console.log("songNumber type is " + typeof songNumber + "\n and currentlyPlayingSongNumber type is " + typeof currentlyPlayingSongNumber);
  return $row;
};

var $albumTitle = $('.album-view-title');
var $albumArtist = $('.album-view-artist');
var $albumReleaseInfo = $('.album-view-release-info');
var $albumImage = $('.album-cover-art');
var $albumSongList = $('.album-view-song-list');

var setCurrentAlbum = function(album) {
  currentAlbum = album;
  $albumTitle.text(album.title);
  $albumArtist.text(album.artist);
  $albumReleaseInfo.text(album.year + ' ' + album.label);
  $albumImage.attr('src', album.albumArtUrl);
  $albumSongList.empty();

  for (var i = 0; i < album.songs.length; i++) {
    var $newRow = createSongRow(i + 1, album.songs[i].title, album.songs[i].duration);
    $albumSongList.append($newRow);
  }
};

var clickHandler = function() {
  var songItem = parseInt($(this).attr('data-song-number'))
  if (currentlyPlayingSongNumber !== null) {
    var currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
    currentlyPlayingCell.html(currentlyPlayingSongNumber);
  }
  if (currentlyPlayingSongNumber !== songItem) {
    $(this).html(pauseButtonTemplate);
    setSong(songItem);
    updatePlayerBarSong();
  } else if (currentlyPlayingSongNumber === songItem) {
    $(this).html(playButtonTemplate);
    $('.main-controls .play-pause').html(playerBarPlayButton);
    setSong(null);
  }
};

var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';
var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';
var playerBarPlayButton = '<span class="ion-play"></span>';
var playerBarPauseButton = '<span class="ion-pause"></span>';
var currentlyPlayingSongNumber = null;
var currentSongFromAlbum = null;
var currentAlbum = null;
var $previousButton = $('.main-controls .previous');
var $nextButton = $('.main-controls .next');

$(document).ready(function() {
  setCurrentAlbum(albumPicasso);
  $previousButton.click(previousSong);
  $nextButton.click(nextSong);
});


$albumImage.click(function() {
  setCurrentAlbum(albums[0]);
  albums.push(albums.shift());
});

var updatePlayerBarSong = function() {
  $('.currently-playing .song-name').text(currentSongFromAlbum.title);
  $('.currently-playing .artist-name').text(currentAlbum.artist);
  $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + " - " + currentAlbum.artist);
};

var trackIndex = function(album, song) {
  return album.songs.indexOf(song);
};

var nextSong = function() {
  var getLastSongNumber = function(index) {
    return index == 0 ? currentAlbum.songs.length : index;
  };
  var songIndex = trackIndex(currentAlbum, currentSongFromAlbum);
  songIndex++;

  if (songIndex >= currentAlbum.songs.length) {
    songIndex = 0;
  }
  setSong(songIndex + 1);
  updatePlayerBarSong();

  var lastSongNumber = getLastSongNumber(songIndex);
  var $nextSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
  var $lastSongNumberCell = getSongNumberCell(lastSongNumber);
  $nextSongNumberCell.html(pauseButtonTemplate);
  $lastSongNumberCell.html(lastSongNumber);
};

var previousSong = function() {
  var getLastSongNumber = function(index) {
    return index == (currentAlbum.songs.length - 1) ? 1 : index + 2;
  };
  var songIndex = trackIndex(currentAlbum, currentSongFromAlbum);
  songIndex--;

  if (songIndex < 0) {
    songIndex = currentAlbum.songs.length - 1;
  }
  setSong(songIndex + 1);
  updatePlayerBarSong();
  $('.main-controls .play-pause').html(playerBarPauseButton);

  var lastSongNumber = getLastSongNumber(songIndex);
  var $previousSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
  var $lastSongNumberCell = getSongNumberCell(lastSongNumber);
  $previousSongNumberCell.html(pauseButtonTemplate);
  $lastSongNumberCell.html(lastSongNumber);

};

var setSong = function(songNumber) {
  currentlyPlayingSongNumber = parseInt(songNumber);
  currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
};

var getSongNumberCell = function (number) {
    return $('.song-item-number[data-song-number="' + number + '"]');
};
