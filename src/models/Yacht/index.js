 import mongoose, { Schema } from 'mongoose';
 import mongooseLeanGetters from "mongoose-lean-getters"

import dotenv from 'dotenv';
import {getObjectSignedUrl} from "utils/s3"


dotenv.config({ path: '.env' });

const yachtSchema = new mongoose.Schema(
  {
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    pendingUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    invitedUsers: [
      {
        name: String,
        email: String,
      },
    ],
    admin: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      // unique: true,
    },
    entries: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Entry',
        // unique: true,
      },
    ],
    name: {
      type: String,
      trim: true,
      required: true,
    },
    flag: {
      type: String,
      required: true,
    },
    officialNumber: {
      type: String,
    },
    yachtUniqueName: {
      type: String,
      required: true,
    },
    yachtImage: {
      type: String,
      required: false,
    },
    // settings: {
    //   private: {
    //     type: Boolean,
    //     default: false,
    //   },
    // },
    isPrivateProfile: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

yachtSchema.virtual('yachtImageSignedUrl').get(async function () {
  const signedUrl = await getObjectSignedUrl(this.yachtImage);
  return signedUrl;
});

// yachtSchema.pre('save', async function (next) {
//   if (this.isModified('name') || this.isModified('flag')) {
//     const yachtUniqueName = this.name.replace(/\s/g, "") + this.flag;
//     console.log(yachtUniqueName)
//     this.yachtUniqueName = yachtUniqueName;
//   }

//   next();
// });

yachtSchema.set('toJSON', { getters: true, virtuals: false });

yachtSchema.plugin(mongooseLeanGetters);

const Yacht = mongoose.model('Yacht', yachtSchema);

export default Yacht;
