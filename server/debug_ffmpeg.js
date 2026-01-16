const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const fs = require('fs');

const log = (msg) => fs.appendFileSync('debug_log.txt', msg + '\n');

log('Starting Debug...');
log(`FFmpeg Path from ffmpeg-static: ${ffmpegPath}`);

if (ffmpegPath) {
    ffmpeg.setFfmpegPath(ffmpegPath);
} else {
    log('ERROR: ffmpegPath is null/undefined');
}

ffmpeg.getAvailableFormats(function (err, formats) {
    if (err) {
        log(`Error getting formats: ${err.message}`);
    } else {
        log(`Formats available: ${Object.keys(formats).length}`);
        log(`AAC available: ${'aac' in formats}`);
        log(`WMA available: ${'wma' in formats}`);
        log(`MP3 available: ${'mp3' in formats}`);
        log(`WAV available: ${'wav' in formats}`);
    }
});

ffmpeg.getAvailableCodecs(function (err, codecs) {
    if (err) {
        log(`Error getting codecs: ${err.message}`);
    } else {
        log(`Codecs available: ${Object.keys(codecs).length}`);
        log(`AAC codec: ${JSON.stringify(codecs['aac'])}`);
    }
});
