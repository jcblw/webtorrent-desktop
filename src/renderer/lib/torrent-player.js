module.exports = {
  isPlayable,
  isVideo,
  isAudio,
  isTorrent,
  isPlayableTorrentSummary,
  pickFileToPlay,
  isInPlaylist,
  getTrackNumber,
  getPlaylistTrack
}

var path = require('path')

// Checks whether a fileSummary or file path is audio/video that we can play,
// based on the file extension
function isPlayable (file) {
  return isVideo(file) || isAudio(file)
}

// Checks whether a fileSummary or file path is playable video
function isVideo (file) {
  return [
    '.avi',
    '.m4v',
    '.mkv',
    '.mov',
    '.mp4',
    '.mpg',
    '.ogv',
    '.webm',
    '.wmv'
  ].includes(getFileExtension(file))
}

// Checks whether a fileSummary or file path is playable audio
function isAudio (file) {
  return [
    '.aac',
    '.ac3',
    '.mp3',
    '.ogg',
    '.wav',
    '.m4a'
  ].includes(getFileExtension(file))
}

// Checks if the argument is either:
// - a string that's a valid filename ending in .torrent
// - a file object where obj.name is ends in .torrent
// - a string that's a magnet link (magnet://...)
function isTorrent (file) {
  var isTorrentFile = getFileExtension(file) === '.torrent'
  var isMagnet = typeof file === 'string' && /^(stream-)?magnet:/.test(file)
  return isTorrentFile || isMagnet
}

function getFileExtension (file) {
  var name = typeof file === 'string' ? file : file.name
  return path.extname(name).toLowerCase()
}

function isPlayableTorrentSummary (torrentSummary) {
  return torrentSummary.files && torrentSummary.files.some(isPlayable)
}

// Picks the default file to play from a list of torrent or torrentSummary files
// Returns an index or undefined, if no files are playable
function pickFileToPlay (files) {
  // first, try to find the biggest video file
  var videoFiles = files.filter(isVideo)
  if (videoFiles.length > 0) {
    var videoFile = largestFile(videoFiles)
    return files.indexOf(videoFile)
  }

  // if there are no videos, play the first audio file
  var audioFiles = files.filter(isAudio)
  if (audioFiles.length > 0) {
    var firstTrack = isInPlaylist(audioFiles[0])
      ? getPlaylistTrack(audioFiles, 1)
      : audioFiles[0]
    return files.indexOf(firstTrack)
  }

  // no video or audio means nothing is playable
  return undefined
}

function isInPlaylist (file) {
  return !isNaN(getTrackNumber(file))
}

function getTrackNumber (file) {
  if (!file.name) return
  return parseInt(file.name.split(' ').shift(), 10)
}

function largestFile (files) {
  return files.reduce(function (a, b) {
    return a.length > b.length ? a : b
  })
}

function getPlaylistTrack (files, number) {
  return files.reduce((currentFile, file) => {
    let trackNumber = getTrackNumber(file)
    if (trackNumber === number) {
      return file
    }
    return currentFile
  }, undefined)
}
