export const assets = {
  video: {
    beginning: null,
    recent: null
  },
  audio: {
    track: { title: '4 U', artist: 'Dixzie Cruel', src: null }
  },
  photos: {
    june26: null
  },
  letters: []
};

export const placeholders = {
  video: {
    beginning: 'VIDEO_PLACEHOLDER_BEGINNING',
    recent: 'VIDEO_PLACEHOLDER_RECENT'
  },
  photo: {
    june26: 'PHOTO_PLACEHOLDER_26_JUNE_2023'
  },
  audio: {
    track: 'AUDIO_PLACEHOLDER_TRACK'
  },
  letter: index => 'LETTER_PLACEHOLDER_' + String(index + 1).padStart(2, '0')
};
