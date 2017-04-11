var albums = [albumPicasso, albumMarconi, albumNichol];

var createSongRow = function(songNumber, songName, songLength) {
  var template =
    '<tr class="album-view-song-item">' +
    '<td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>' +
    '<td class="song-item-title">' + songName + '</td>' +
    '<td class="song-item-duration">' + filterTimeCode(songLength) + '</td>' + '</tr>';

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

 var updateSeekBarWhileSongPlays = function() {
     if (currentSoundFile) {
         currentSoundFile.bind('timeupdate', function(event) {
             var seekBarFillRatio = this.getTime() / this.getDuration();
             var $seekBar = $('.seek-control .seek-bar');
             setCurrentTimeInPlayerBar(filterTimeCode(this.getTime()));
             updateSeekPercentage($seekBar, seekBarFillRatio);             
         });
     }
 };

var updateSeekPercentage = function($seekBar, seekBarFillRatio) {
    var offsetXPercent = seekBarFillRatio * 100;
    offsetXPercent = Math.max(0, offsetXPercent);
    offsetXPercent = Math.min(100, offsetXPercent);
    var percentageString = offsetXPercent + '%';
    $seekBar.find('.fill').width(percentageString);
    $seekBar.find('.thumb').css({left: percentageString});
};

var setupSeekBars = function() {
    var $seekBars = $('.player-bar .seek-bar'); 
     $seekBars.click(function(event) {
         var offsetX = event.pageX - $(this).offset().left;
         var barWidth = $(this).width();
         var seekBarFillRatio = offsetX / barWidth;
         if ($(this).parent().attr('class') == 'seek-control') {
            seek(seekBarFillRatio * currentSoundFile.getDuration());
         } else {
            setVolume(seekBarFillRatio * 100);   
         }
        
        updateSeekPercentage($(this), seekBarFillRatio);
    });
    $seekBars.find('.thumb').mousedown(function(event) {
         var $seekBar = $(this).parent();
         $(document).bind('mousemove.thumb', function(event){
             var offsetX = event.pageX - $seekBar.offset().left;
             var barWidth = $seekBar.width();
             var seekBarFillRatio = offsetX / barWidth;
             if ($seekBar.parent().attr('class') == 'seek-control') {
                seek(seekBarFillRatio * currentSoundFile.getDuration());   
             } else {
                setVolume(seekBarFillRatio);
             }
 
             updateSeekPercentage($seekBar, seekBarFillRatio);             
         });
         $(document).bind('mouseup.thumb', function() {
             $(document).unbind('mousemove.thumb');
             $(document).unbind('mouseup.thumb');
         });
     });
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
    currentSoundFile.play();
    updateSeekBarWhileSongPlays();
    var $volumeFill = $('.volume .fill');
    var $volumeThumb = $('.volume .thumb');
    $volumeFill.width(currentVolume + '%');
    $volumeThumb.css({left: currentVolume + '%'});
    updatePlayerBarSong();
    $('.main-controls .play-pause').html(playerBarPauseButton);
  } else if (currentlyPlayingSongNumber === songItem) {      
      if (currentSoundFile.isPaused()) {
        $(this).html(pauseButtonTemplate);
        $('.main-controls .play-pause').html(playerBarPauseButton);
        currentSoundFile.play();
      } else {
          $(this).html(playButtonTemplate);
          $('.main-controls .play-pause').html(playerBarPlayButton);
           currentSoundFile.pause();  
      }      
  }
};

var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';
var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';
var playerBarPlayButton = '<span class="ion-play"></span>';
var playerBarPauseButton = '<span class="ion-pause"></span>';
var currentlyPlayingSongNumber = null;
var currentSongFromAlbum = null;
var currentAlbum = null;
var currentSoundFile = null;
var currentVolume = 80;
var $previousButton = $('.main-controls .previous');
var $nextButton = $('.main-controls .next');
var $playButton = $('.main-controls .play-pause');

$(document).ready(function() {
  setCurrentAlbum(albumPicasso);  
  setupSeekBars();
  $previousButton.click(previousSong);
  $nextButton.click(nextSong);
  $playButton.click(togglePlayFromPlayerBar); 
  setSong(1);
  updatePlayerBarSong();
  updateSeekBarWhileSongPlays();
});


$albumImage.click(function() {
  setCurrentAlbum(albums[0]);
  albums.push(albums.shift());
});

var updatePlayerBarSong = function() {
  $('.currently-playing .song-name').text(currentSongFromAlbum.title);
  $('.currently-playing .artist-name').text(currentAlbum.artist);
  $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + " - " + currentAlbum.artist);
  setTotalTimeInPlayerBar(filterTimeCode(currentSongFromAlbum.duration));
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
  currentSoundFile.play();
  updateSeekBarWhileSongPlays();
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
  currentSoundFile.play();
  updateSeekBarWhileSongPlays();
  updatePlayerBarSong();
  $('.main-controls .play-pause').html(playerBarPauseButton);

  var lastSongNumber = getLastSongNumber(songIndex);
  var $previousSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
  var $lastSongNumberCell = getSongNumberCell(lastSongNumber);
  $previousSongNumberCell.html(pauseButtonTemplate);
  $lastSongNumberCell.html(lastSongNumber);

};

var setSong = function(songNumber) {
  if (currentSoundFile) {
         currentSoundFile.stop();
  }
  currentlyPlayingSongNumber = parseInt(songNumber);
  currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
  currentSoundFile = new buzz.sound(currentSongFromAlbum.audioUrl, {
    formats: [ 'mp3' ],
    preload: true
     });
  setVolume(currentVolume);
};

var getSongNumberCell = function (number) {
    return $('.song-item-number[data-song-number="' + number + '"]');
};

var seek = function(time) {
     if (currentSoundFile) {
         currentSoundFile.setTime(time);
     }
 }

var setVolume = function(volume) {
  if (currentSoundFile) {
    currentSoundFile.setVolume(volume);
  }
};

var togglePlayFromPlayerBar = function() {
    var currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
    currentlyPlayingCell.html(currentlyPlayingSongNumber);
    if(currentSoundFile.isPaused()) {
      getSongNumberCell(currentlyPlayingSongNumber);
      $(this).html(playerBarPauseButton);      
      currentlyPlayingCell.html(pauseButtonTemplate)
      currentSoundFile.play();
    } else if(currentSoundFile.isPaused() == false) {
      getSongNumberCell(currentlyPlayingSongNumber);
      $(this).html(playerBarPlayButton);      
      currentlyPlayingCell.html(playButtonTemplate)
      currentSoundFile.pause();
    }
};

var setCurrentTimeInPlayerBar = function(currentTime) {
    return ($('.currently-playing .current-time').text(currentTime));
};
   
var setTotalTimeInPlayerBar = function(totalTime) {
    return ($('.currently-playing .total-time').text(totalTime));
};

var filterTimeCode  = function(timeInSeconds) {
    var minutes = Math.floor(parseInt(timeInSeconds)/60);
    var seconds = Math.floor(parseInt(timeInSeconds)%60);
    var timeBlock = "" + minutes + ":" + seconds + "";
    return timeBlock;
};
   
