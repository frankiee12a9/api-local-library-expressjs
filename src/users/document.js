import mongoose from 'mongoose';
import mongooseSmartQuery from '../shared/mongoose-smart-query.js';

var Schema = mongoose.Schema;

var UserSchema = new Schema(
  {
    user_id: {
      type: String,
      lowercase: true,
      trim: true,
      unique: true,
      required: true,
    },
    first_name: { type: String, required: true, maxLength: 100 },
    family_name: { type: String, required: true, maxLength: 100 },
    profile_image: { type: Schema.Types.ObjectId, ref: 'images' },
  },
  {
    timestamps: true,
  }
);

// Virtual for author "full" name.
UserSchema.virtual('name').get(function () {
  return this.family_name + ', ' + this.first_name;
});

// Virtual for this author instance URL.
UserSchema.virtual('url').get(function () {
  return 'users/' + this._id;
});

UserSchema.virtual('blockAt').get(function () {
  return this.blockExpiresAt > new Date();
});

/**
 * 사용자 저장 전 비밀번호가 변경되었거나 새로운 등록이면
 * 암호화 처리
 */
UserSchema.pre('save', function save(next) {
  const user = this;
  if (this.isDirectModified('password') || this.isNew) {
    // user.password = bcrypt.hash(this.password, bcrypt.genSaltSync(10), null)
    //   .then(() => next())
    //   .catch(e => next(e));
    user.password = crypto
      .createHash('SHA256')
      .update(Buffer.from(this.password, 'utf16le'))
      .digest('hex');
    next();
  } else {
    next();
  }
});

/**
 * 비밀번호 검증
 * @type {{comparePassword(*=, *): void}}
 */
const methods = {
  comparePassword(passw) {
    const crpytPass = crypto
      .createHash('SHA256')
      .update(Buffer.from(passw, 'utf16le'))
      .digest('hex');
    return crpytPass === this.password;
  },
};

userSchema.methods = methods;

UserSchema.plugin(mongooseSmartQuery);

export const Users = mongoose.model('users', UserSchema);
