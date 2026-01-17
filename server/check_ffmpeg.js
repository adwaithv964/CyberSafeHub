const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');

console.log("FFmpeg Path:", ffmpegPath);
ffmpeg.setFfmpegPath(ffmpegPath);

ffmpeg.getAvailableFormats(function (err, formats) {
    if (err) {
        console.error("Error getting formats:", err.message);
    } else {
        console.log("FFmpeg is executable!");
        if (formats.hevc) console.log("HEVC (HEIC) supported");
        if (formats.mjpeg) console.log("MJPEG supported");
    }
});
