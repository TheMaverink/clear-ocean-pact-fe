import Yacht from '@models/Yacht';
import User from '@models/User';
import Entry from '@models/Entry';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config({ path: '.env' });

const AWS = require('aws-sdk');
const s3 = new AWS.S3({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: process.env.BUCKET_REGION,
});

export const createEntry = async (req, res, next) => {
  const { latitude, longitude } = req.body;
  const types = JSON.parse(req.body.types);
  console.log('REQ BODYYY')
  console.log(req.body)
  console.log('REQ BODYYY')

  try {
    const bucketUrl =
      'https://' +
      process.env.BUCKET_NAME +
      '.s3.' +
      process.env.BUCKET_REGION +
      '.amazonaws.com/';

    function uploadFile(buffer, fileName) {
      return new Promise((resolve, reject) => {
        s3.upload(
          {
            Body: buffer,
            Key: fileName,
            Bucket: process.env.BUCKET_NAME,
            ContentType: 'image/jpeg',
          },
          (error) => {
            if (error) {
              console.log(error);
              reject(error);
            } else {
              console.info(fileName);
              resolve(fileName);
            }
          }
        );
      });
    }

    const promises = [];

  

    req.files.forEach((file) => {
      // console.log(file)
      promises.push(uploadFile(file.buffer, Date.now().toString()));
    });

    const imageSavedUrls = await Promise.all(promises).then((results) => {
     
      console.log('images uploaded');
     return results.map((file) => {
        return bucketUrl + file;
      });

     


    });


  



    const location = {
      type: 'Point',
      coordinates: [longitude, latitude],
    };

    const newEntry = new Entry({
      location,
      types,
      imageUrls: imageSavedUrls || null ,
      author: req.user.id,
      yacht: req.user.yacht,
    });

    console.log(req.user);

    await newEntry.save();

      const yachtToUpdate = await Yacht.findById(newEntry.yacht);

      await yachtToUpdate.entries.push(newEntry);

      await yachtToUpdate.save();

      const userToUpdate = await User.findOneAndUpdate(
        { _id: req.user._id },
        { $push: { entries: newEntry._id } }
      );
      await userToUpdate.save();
      res.status(200).send(newEntry);
  } catch (error) {
    res.status(500).send('Server Error');
    console.log(error.message);
  }
};

export const getAllGlobalEntries = async (req, res, next) => {
  try {
    const globalEntries = await Entry.find({}).populate(
      'author',
      '-tokens -password'
    );

    res.json(globalEntries);
  } catch (error) {
    res.status(500).send('Server Error');
    console.log(error.message);
  }
};

export const getAllYachtEntries = async (req, res, next) => {
  try {
    const yachtId = req.user.yacht;

    const yachtEntries = await Entry.find({ yacht: yachtId }).populate(
      'author',
      '-tokens -password'
    );

    res.json(yachtEntries);
  } catch (error) {
    res.status(500).send('Server Error');
    console.log(error.message);
  }
};

export const editEntry = async (req, res, next) => {
  const { entryType } = req.body;
  const entryId = req.params.id;

  try {
    const entryToUpdate = await Entry.findById(entryId);
    entryToUpdate['type'] = entryType;

    await entryToUpdate.save();

    res.status(200).send(entryToUpdate);
  } catch (error) {
    console.log('error from catch backend');
    console.log(error);
    res.status(400).send(error);
  }
};

export const deleteEntry = async (req, res, next) => {
  const entryId = req.params.id;
  try {
    await Entry.findOneAndRemove({ _id: entryId });

    res.json({ msg: 'Entry deleted' });
  } catch (error) {
    res.status(500).send('Server Error');
    console.log(error.message);
  }
};

// export const populateEntries = async (req, res, next) => {
//   try {
//     let doc = await Yacht.findOneAndUpdate(
//       { yachtUniqueName: 'HugoBEL' },
//       {
//         invitedUsers: [
//           { email: 'userb@gmail.com', name: 'userB' },
//           { email: 'a@a.com', name: 'ju' },
//           { email: 'b@b.com', name: 'ju' },
//           { email: 'c@c.com', name: 'ju' },
//           { email: 'd@d.com', name: 'ju' },
//           { email: 'e@e.com', name: 'ju' },
//           { email: 'jf@jf.com', name: 'ju' },
//           { email: 'jm@jm.com', name: 'ju' },
//           { email: 'f@f.com', name: 'ju' },
//           { email: 'g@g.com', name: 'ju' },
//           { email: 'jh@jh.com', name: 'ju' },
//           { email: 'h@h.com', name: 'ju' },
//         ],
//       },
//       {
//         new: true,
//       }
//     );

//     res.status(200).send(doc);
//   } catch (error) {
//     res.status(500).send('Server Error');
//     console.log(error.message);
//   }
// };
