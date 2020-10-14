const sharp = require('sharp');
// https://github.com/lovell/sharp
// http://sharp.pixelplumbing.com/en/stable/

exports.getInstance = function () {
  return new ThumbManager();
};

var ThumbManager = function () {
  var setting = require('../../system/Setting.js').getInstance();
  this.ffmpeg = setting.get('ffmpeg');
}

// http://127.0.0.1:3000/upload?fit=contain&width=100&height=100
ThumbManager.prototype.image = async function (file, query) {
  var path = file.path;
  var fit = getFit(query.fit);
  var w = parseInt(query.width) || (query.height ? null : 100);
  var h = parseInt(query.height) || null;

  var outPath = path + '.mini.jpg';
  await sharp(path).rotate().resize(w, h, {
    fit: fit,
    background: {
      r: 0,
      g: 0,
      b: 0,
      alpha: 1
    }
  }).jpeg({
    quality: 90
  }).toFile(outPath).then(data => {});

  return outPath;

  function getFit(fit) {
    if (fit === "cover" || fit === "contain" || fit === "fill" || fit === "inside" || fit === "outside") {
      return fit;
    }
    return "cover";
  }
}

ThumbManager.prototype.video = function (file, query) {
  var path = file.path;
  var fit = getFit(query.fit);
  var w = parseInt(query.width) || -1;
  var h = parseInt(query.height) || -1;

  var scale;
  if (fit == 'cover') {
    scale = ' -vf "scale=' + w + ':' + h + ':force_original_aspect_ratio=increase,crop=' + w + ':' + h + '"';
  } else if (fit == 'contain') {
    scale = ' -vf "scale=' + w + ':' + h + ':force_original_aspect_ratio=decrease,pad=' + w + ':' + h + ':(ow-iw)/2:(oh-ih)/2"';
  } else if (fit == 'fill') {
    scale = ' -vf "scale=' + w + ':' + h + '"';
  } else if (fit == 'inside') {
    scale = ' -vf "scale=\'if(lt(' + w + '/iw, ' + h + '/ih),' + w + ',-1)\':\'if(lt(' + w + '/iw, ' + h + '/ih),-1,' + h + ')\'"';
  } else if (fit == 'outside') {
    scale = ' -vf "scale=\'if(gt(' + w + '/iw, ' + h + '/ih),' + w + ',-1)\':\'if(gt(' + w + '/iw, ' + h + '/ih),-1,' + h + ')\'"';
  }
  var out = path + '.jpg';
  var source = ' "' + path + '"';
  var argument = ' -i' + source + scale + ' -f image2 -vframes 1 -ss 3 -an -deinterlace "' + out + '"';
  var cmd = this.ffmpeg + ' ' + argument;
  return new Promise((resolve, reject) => {
    require('child_process').exec(cmd, (err, stdout, stderr) => {
      console.log('err:', err);
      console.log('stdout:', stdout);
      console.log('stderr:', stderr);
      resolve(out);
    });
  });

  function getFit(fit) {
    if (fit === "cover" || fit === "contain" || fit === "fill" || fit === "inside" || fit === "outside") {
      return fit;
    }
    return "cover";
  }
}