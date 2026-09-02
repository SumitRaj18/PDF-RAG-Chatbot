// config/passport.js
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import passport from 'passport';
import User from '../models/User.js';

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'https://pdf-rag-chatbot-0le9.onrender.com/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });

    if (!user) {
      const email = profile.emails[0].value.toLowerCase();
      user = await User.findOne({ email });

      if (user) {
        // Existing local account with this email — link Google to it
        user.googleId = profile.id;
        if (!user.name) user.name = profile.displayName;
        if (!user.avatar) user.avatar = profile.photos[0].value;
        await user.save();
      } else {
        // Brand new user
        user = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email,
          avatar: profile.photos[0].value
        });
      }
    }

    done(null, user);
  } catch (err) {
    done(err, null);
  }
}));