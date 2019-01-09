const mongoose = require("mongoose");
import {Schema,model,Model} from "mongoose";

var UserSchema = mongoose.Schema({
    name: {
        names: String,
        lastName: String
    },
    email: String,
    phone: String
    });

module.exports = UserSchema;

