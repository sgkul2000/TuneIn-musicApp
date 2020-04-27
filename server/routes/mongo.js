const mongodb = require('mongodb');
const mongoUri = 'mongodb://localhost'

module.exports = class mongo {
  static async getSongs() {
    const client = await mongodb.MongoClient.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    return client.db('TuneIn').collection('tracks');
  }

  static async play() {
    const client = await mongodb.MongoClient.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    return client.db('TuneIn').collection('playlists');
  }
}



// static initDB(list, patH) {
//   return new Promise(async (resolve, reject) => {
//     for (var i = 0; i < list.length; i++) {
//       var songFile = list[i]
//       // songPath = __dirname + '/../music/' + songFile + '.mp3'
//       var songPath = patH + songFile + '.mp3'
//       var img = await mm.parseFile(songPath).then(metadata => {
//         return metadata.common.picture[0].data;
//       }).catch(err => {
//         console.log(err);
//       });
//       // res.attachment('output.jpg')
//       // var opImg = img;
//       await Jimp.read(img, (err, image) => {
//         if (err) throw err;
//         image.crop(100, 400, 1024, 480)
//           .opacity(0.5)
//           .quality(50)
//           .write( patH + 'images/' + songFile + '.jpg');
//         // res.type('jpg');
//         ;
//       });
//     }
//     var status = true
//     if(status){
//       resolve()
//     }
//   })
// }
