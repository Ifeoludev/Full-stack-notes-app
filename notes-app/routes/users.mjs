import path from "path";
import util from "util";
import express from "express";
import passport from "passport";
import passportLocal from "passport-local";

import passportGitHub from "passport-github2";
const LocalStrategy = passportLocal.Strategy;
const GitHubStrategy = passportGitHub.Strategy;
import dotenv from "dotenv";
dotenv.config();
import * as usersModel from "../models/users-superagent.mjs";
import { sessionCookieName } from "../app.mjs";

export const router = express.Router();

import DBG from "debug";
const debug = DBG("notes:router-users");
const error = DBG("notes:error-users");

//Initializing Passport
export function initPassport(app) {
  app.use(passport.initialize());
  app.use(passport.session());
}

//Protects the route and ensures it is authenticated
export function ensureAuthenticated(req, res, next) {
  try {
    // req.user is set by Passport in the deserialize function
    if (req.user) next();
    else res.redirect("/users/login");
  } catch (e) {
    next(e);
  }
}

router.get("/login", function (req, res, next) {
  try {
    res.render("login", { title: "Login to Notes", user: req.user });
  } catch (e) {
    next(e);
  }
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/", // SUCCESS: Go to home page
    failureRedirect: "login", // FAIL: Go to userlogin
  }),
);

router.get("/auth/github", passport.authenticate("github"));

router.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/users/login" }),
  function (req, res) {
    res.redirect("/");
  },
);

router.get("/logout", function (req, res, next) {
  try {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      req.session.destroy();
      res.clearCookie(sessionCookieName);
      res.redirect("/");
    });
  } catch (e) {
    next(e);
  }
});

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      //Calls User service to verify password
      var check = await usersModel.userPasswordCheck(username, password);
      //Return true/false to Passport
      if (check.check) {
        done(null, { id: check.username, username: check.username });
      } else {
        done(null, false, check.message);
      }
    } catch (e) {
      done(e);
    }
  }),
);

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL:
        process.env.GITHUB_CALLBACK_URL ||
        "http://localhost:3000/users/auth/github/callback",
      userAgent: "notes-app",
    },
    async function (accessToken, refreshToken, profile, done) {
      console.log("OAuth Config Check:");
      console.log("ClientID:", process.env.GITHUB_CLIENT_ID);
      console.log("CallbackURL:", process.env.GITHUB_CALLBACK_URL);
      try {
        var user = await usersModel.findOrCreate({
          id: profile.username,
          username: profile.username,
          password: "",
          provider: profile.provider,
          familyName: profile.displayName,
          givenName: "",
          middleName: "",
          emails: profile.emails,
          photos: profile.photos,
        });
        done(null, user);
      } catch (err) {
        done(err);
      }
    },
  ),
);

passport.serializeUser(function (user, done) {
  try {
    done(null, user.username);
  } catch (e) {
    done(e);
  }
});

passport.deserializeUser(async (username, done) => {
  try {
    var user = await usersModel.find(username);
    done(null, user);
  } catch (e) {
    done(e);
  }
});
