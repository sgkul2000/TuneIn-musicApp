const express = require('express');
const mongodb = require('mongodb');
const fs = require('fs');
const process = require('process');
const path = require('path');
const mm = require('music-metadata');
const im = require("imagemagick");
const Jimp = require('jimp');

const musicPath = __dirname + '/../music/';

router = express.Router();
const mongo = require('./mongo');

router.get('/tracks/', async (req, res) => {
  try {
    const db = mongo.getSongs();
    res.send(db.find().toArray());
  } catch (err) {
    console.log(err);
    res.status(404).send('File.not found');
  }
})

router.get('/allSongs/', async (req, res) => {
  try {
    var songsList = [];
    await fs.readdir(musicPath, async (err, files) => {
      if (err) {
        console.log("could not load: " + err);
        process.exit();
      }
      for (const file of files) {
        var song = path.join(musicPath, file);
        var sings = [];
        var Obj = await mm.parseFile(song)
          .then(metadata => {
            //remove . mp3
            var minutes = Math.floor(metadata.format.duration / 60);
            var seconds = Math.floor(metadata.format.duration - (minutes * 60));
            var dur = minutes.toString() + ':' + seconds.toString();
            var songYear = metadata.common.year.toString();
            var obj = {
              "code": file.slice(0, -4),
              "name": metadata.common.title,
              "artist": metadata.common.artist,
              "duration": dur,
              "year": songYear
            };
            return obj;
            // console.log(obj);
            // console.log(metadata);
          })
          .catch(err => {
            console.error(err.message);
          });
        songsList.push(Obj);
        // console.log(songsList);
      }
      // resolve(songsList);
      // console.log(songsList);
      res.status(201).send(songsList);
    });

  } catch (err) {
    console.log(err);
  }
});

router.get('/image/:code/', async (req, res) => {
  try {
    songPath = __dirname + '/../music/' + req.params.code + '.mp3'
    mm.parseFile(songPath).then(metadata => {
      res.send(metadata.common.picture[0].data);
    }).catch(err => {
      console.log(err);
    })
  }catch(err){
    console.log(err);
    res.status(404).send(err)
  }
});

router.get('/image/carousel/:code', async (req, res) => {
  try{
    var imgPath = __dirname + '/../images/' + req.params.code + '.jpg';
    var imgpath = path.resolve(imgPath)
    res.sendFile(imgpath);
  } catch(err){
    console.log(err);
    res.status(404).send();
  }

})

router.get('/image/carousel/init/:code/', async (req, res) => {
  try {
    songPath = __dirname + '/../music/' + req.params.code + '.mp3'
    var img = await mm.parseFile(songPath).then(metadata => {
      return metadata.common.picture[0].data;
    }).catch(err => {
      console.log(err);
    });
    // res.attachment('output.jpg')
    // var opImg = img;
    await Jimp.read(img, (err, image) => {
      if(err) throw err;
      image.crop(100,400,1024,480)
      .opacity(0.5)
      .quality(30)
      .write(__dirname + '/../images/'+ req.params.code +'.jpg', () => {
        res.status(201).send()
      });
      // res.type('jpg');
    ;
    });

    res.status(201).send();
  }catch(err){
    console.log(err);
    res.status(404).send();
  }

});

router.get('/stream/:code/', async (req, res) => {
  const file = __dirname + '/../music/' + req.params.code + '.mp3';
  const stat = fs.statSync(file);
  const total = stat.size;
  if (req.headers.range) {

  }
  fs.exists(file, (exists) => {
    if (exists) {
      const range = req.headers.range;
      const parts = range.replace(/bytes=/, '').split('-');
      const partialStart = parts[0];
      const partialEnd = parts[1];

      const start = parseInt(partialStart, 10);
      const end = partialEnd ? parseInt(partialEnd, 10) : total - 1;
      const chunksize = (end - start) + 1;
      const rstream = fs.createReadStream(file, {
        start: start,
        end: end
      });

      res.writeHead(206, {
        'Content-Range': 'bytes ' + start + '-' + end + '/' + total,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'audio/mpeg'
      });
      rstream.pipe(res);

    } else {
      res.send('Error - 404');
      res.end();
      // res.writeHead(200, { 'Content-Length': total, 'Content-Type': 'audio/mpeg' });
      // fs.createReadStream(path).pipe(res);
    }
  });
});

router.get('/play/:name', async (req, res) => {
  try{
    const db = await mongo.play();
    const data = await db.find({ name: req.params.name }).toArray();
    // console.log(data);
    res.send(data);
  } catch(err) {
    console.log(err);
    res.status(404).send();
  }
});


module.exports = router;
